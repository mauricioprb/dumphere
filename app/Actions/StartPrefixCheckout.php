<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Document;
use App\Support\RecoveryKey;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Stripe\Checkout\Session;
use Stripe\StripeClient;
use Throwable;

final class StartPrefixCheckout
{
    public const EXPIRATION_MINUTES = 60;

    public function __construct(private readonly StripeClient $stripe) {}

    public function execute(
        string $prefix,
        string $priceId,
        string $recoveryKey,
        string $successUrl,
        string $cancelUrl,
    ): Session {
        $reservationId = (string) Str::uuid();
        $reservedUntil = now()->addMinutes(self::EXPIRATION_MINUTES);

        $document = Document::firstOrCreate(
            ['slug' => $prefix],
            ['title' => ucwords(str_replace('-', ' ', $prefix)), 'content_html' => ''],
        );

        DB::transaction(function () use ($document, $recoveryKey, $reservationId, $reservedUntil): void {
            $locked = Document::query()->lockForUpdate()->findOrFail($document->getKey());

            if ($this->isUnavailable($locked)) {
                throw ValidationException::withMessages(['prefix' => __('prefix.address_taken')]);
            }

            $locked->forceFill([
                'checkout_reservation_id' => $reservationId,
                'checkout_reserved_until' => $reservedUntil,
                'checkout_session_id' => null,
                'checkout_claim_hash' => RecoveryKey::digest($recoveryKey),
            ])->save();
        }, attempts: 5);

        $session = $this->stripe->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => [
                ['price' => $priceId, 'quantity' => 1],
            ],
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'expires_at' => $reservedUntil->timestamp,
            'metadata' => [
                'prefix' => $prefix,
                'reservation' => $reservationId,
            ],
            'client_reference_id' => $prefix,
        ], ['idempotency_key' => $reservationId]);

        $attached = DB::transaction(function () use ($document, $reservationId, $session): bool {
            $locked = Document::query()->lockForUpdate()->findOrFail($document->getKey());

            if (! hash_equals((string) $locked->checkout_reservation_id, $reservationId)) {
                return false;
            }

            $locked->forceFill(['checkout_session_id' => $session->id])->save();

            return true;
        }, attempts: 5);

        if (! $attached) {
            try {
                $this->stripe->checkout->sessions->expire($session->id);
            } catch (Throwable) {
                Log::warning('A detached checkout session could not be expired.', [
                    'session_fingerprint' => substr(hash('sha256', $session->id), 0, 12),
                ]);
            }

            throw ValidationException::withMessages(['prefix' => __('prefix.address_taken')]);
        }

        return $session;
    }

    private function isUnavailable(Document $document): bool
    {
        if ($document->paid_until?->isFuture() || $document->checkout_session_id !== null) {
            return true;
        }

        return $document->checkout_reservation_id !== null
            && $document->checkout_reserved_until?->isFuture() === true;
    }
}
