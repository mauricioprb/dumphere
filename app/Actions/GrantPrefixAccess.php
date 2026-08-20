<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Document;
use App\Support\DocumentSlug;
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
            ['expand' => ['payment_intent.latest_charge']],
        );

        if ($session->payment_status !== 'paid') {
            return null;
        }

        $expected = (string) ($session->metadata['claim'] ?? '');

        if ($claim !== null && ($expected === '' || ! hash_equals($expected, $claim))) {
            Log::warning('Claim attempted from a browser that did not start the checkout.', [
                'session' => $sessionId,
            ]);

            return null;
        }

        $prefix = DocumentSlug::normalize((string) ($session->metadata['prefix'] ?? ''));

        if ($prefix === '' || str_contains($prefix, '/') || ! DocumentSlug::isValid($prefix)) {
            Log::warning('Checkout session paid for an unusable prefix.', ['session' => $sessionId]);

            return null;
        }

        $document = Document::firstOrCreate(
            ['slug' => $prefix],
            ['title' => ucwords(str_replace('-', ' ', $prefix)), 'content_html' => ''],
        );

        if ($this->belongsToSomeoneElse($document, $sessionId)) {
            Log::warning('Checkout session paid for an already owned prefix; refund required.', [
                'session' => $sessionId,
                'prefix' => $prefix,
            ]);

            return null;
        }

        if ($document->stripe_session_id === $sessionId) {
            return $document;
        }

        $paidFrom = $document->paid_until?->isFuture() ? $document->paid_until : now();

        $document->forceFill([
            'paid_until' => $paidFrom->copy()->addYears(max(1, (int) config('stripe.years'))),
            'stripe_session_id' => $sessionId,
            'stripe_receipt_url' => $session->payment_intent?->latest_charge?->receipt_url,
            'last_accessed_at' => now(),
        ])->save();

        return $document;
    }

    private function belongsToSomeoneElse(Document $document, string $sessionId): bool
    {
        return $document->owner_password_hash !== null
            && $document->stripe_session_id !== null
            && $document->stripe_session_id !== $sessionId;
    }
}
