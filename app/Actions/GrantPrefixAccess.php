<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Document;
use App\Support\DocumentSlug;
use App\Support\RecoveryKey;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;

class GrantPrefixAccess
{
    public function __construct(private readonly StripeClient $stripe) {}

    /**
     * @param  string|null  $claim  The browser's claim cookie. Payment is recorded either way,
     *                              but a session started elsewhere never grants ownership here.
     */
    public function execute(string $sessionId, ?string $claim = null): ?Document
    {
        $session = $this->stripe->checkout->sessions->retrieve(
            $sessionId,
        );

        if ($session->payment_status !== 'paid') {
            if ($session->status === 'complete') {
                $this->holdPendingCheckout(
                    $sessionId,
                    (string) ($session->metadata['reservation'] ?? ''),
                );
            }

            return null;
        }

        $prefix = DocumentSlug::normalize((string) ($session->metadata['prefix'] ?? ''));
        $reservationId = (string) ($session->metadata['reservation'] ?? '');
        $legacyClaim = (string) ($session->metadata['claim'] ?? '');

        if ($claim !== null && $legacyClaim !== '' && ! hash_equals($legacyClaim, $claim)) {
            $this->logClaimMismatch($sessionId);

            return null;
        }

        if ($prefix === '' || str_contains($prefix, '/') || ! DocumentSlug::isValid($prefix)) {
            Log::warning('Checkout session paid for an unusable prefix.', [
                'session_fingerprint' => self::sessionFingerprint($sessionId),
            ]);

            return null;
        }

        $document = Document::firstOrCreate(
            ['slug' => $prefix],
            ['title' => ucwords(str_replace('-', ' ', $prefix)), 'content_html' => ''],
        );

        return DB::transaction(function () use (
            $claim,
            $document,
            $legacyClaim,
            $sessionId,
            $prefix,
            $reservationId,
        ): ?Document {
            $locked = Document::query()->lockForUpdate()->findOrFail($document->getKey());

            if ($locked->stripe_session_id === $sessionId) {
                if (! $this->claimMatches($locked, $claim, $legacyClaim)) {
                    $this->logClaimMismatch($sessionId);

                    return null;
                }

                if ($locked->owner_recovery_key_hash === null && $legacyClaim !== '') {
                    $locked->forceFill([
                        'owner_recovery_key_hash' => RecoveryKey::digest($legacyClaim),
                    ])->save();
                }

                return $locked;
            }

            if ($this->belongsToSomeoneElse($locked, $sessionId)
                || ! $this->matchesReservation($locked, $sessionId, $reservationId)) {
                Log::warning('Checkout session does not own the prefix reservation.', [
                    'session_fingerprint' => self::sessionFingerprint($sessionId),
                    'prefix' => $prefix,
                ]);

                return null;
            }

            if (! $this->claimMatches($locked, $claim, $legacyClaim)) {
                $this->logClaimMismatch($sessionId);

                return null;
            }

            $paidFrom = $locked->paid_until?->isFuture() ? $locked->paid_until : now();
            $recoveryKeyHash = $locked->checkout_claim_hash
                ?? ($legacyClaim !== '' ? RecoveryKey::digest($legacyClaim) : null);

            $locked->forceFill([
                'paid_until' => $paidFrom->copy()->addYears(max(1, (int) config('stripe.years'))),
                'stripe_session_id' => $sessionId,
                'owner_recovery_key_hash' => $recoveryKeyHash,
                'checkout_claim_hash' => null,
                'checkout_reservation_id' => null,
                'checkout_reserved_until' => null,
                'checkout_session_id' => null,
                'last_accessed_at' => now(),
            ])->save();

            return $locked;
        }, attempts: 5);
    }

    private static function sessionFingerprint(string $sessionId): string
    {
        return substr(hash('sha256', $sessionId), 0, 12);
    }

    private function belongsToSomeoneElse(Document $document, string $sessionId): bool
    {
        return $document->paid_until?->isFuture() === true
            && $document->stripe_session_id !== null
            && $document->stripe_session_id !== $sessionId;
    }

    private function matchesReservation(Document $document, string $sessionId, string $reservationId): bool
    {
        if ($document->checkout_session_id === $sessionId) {
            return true;
        }

        if ($reservationId !== '') {
            return $document->checkout_reservation_id !== null
                && hash_equals((string) $document->checkout_reservation_id, $reservationId);
        }

        return $document->checkout_session_id === null
            && $document->checkout_reservation_id === null;
    }

    private function holdPendingCheckout(string $sessionId, string $reservationId): void
    {
        DB::transaction(function () use ($sessionId, $reservationId): void {
            $document = Document::query()
                ->where(function (Builder $query) use ($sessionId, $reservationId): void {
                    $query->where('checkout_session_id', $sessionId);

                    if ($reservationId !== '') {
                        $query->orWhere('checkout_reservation_id', $reservationId);
                    }
                })
                ->lockForUpdate()
                ->first();

            if ($document === null) {
                return;
            }

            $document->forceFill([
                'checkout_session_id' => $sessionId,
                'checkout_reserved_until' => null,
            ])->save();
        }, attempts: 5);
    }

    private function claimMatches(Document $document, ?string $claim, string $legacyClaim): bool
    {
        if ($claim === null) {
            return true;
        }

        $digest = $document->owner_recovery_key_hash ?? $document->checkout_claim_hash;

        return RecoveryKey::matches($claim, $digest)
            || ($digest === null && $legacyClaim !== '' && hash_equals($legacyClaim, $claim));
    }

    private function logClaimMismatch(string $sessionId): void
    {
        Log::warning('Claim attempted from a browser that did not start the checkout.', [
            'session_fingerprint' => self::sessionFingerprint($sessionId),
        ]);
    }
}
