<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\GrantPrefixAccess;
use App\Actions\ReleasePrefixCheckout;
use App\Actions\StartPrefixCheckout;
use App\Support\DocumentSlug;
use App\Support\MarketPrice;
use App\Support\RecoveryKey;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use UnexpectedValueException;

class CheckoutController
{
    public function __construct(
        private readonly StartPrefixCheckout $startCheckout,
        private readonly GrantPrefixAccess $grantAccess,
        private readonly ReleasePrefixCheckout $releaseCheckout,
    ) {}

    public function create(Request $request): SymfonyResponse
    {
        $prefix = DocumentSlug::normalize((string) $request->input('prefix'));

        if (str_contains($prefix, '/') || ! DocumentSlug::isValid($prefix)) {
            throw ValidationException::withMessages(['prefix' => __('prefix.address_unavailable')]);
        }

        $recoveryKey = RecoveryKey::generate();

        $session = $this->startCheckout->execute(
            prefix: $prefix,
            priceId: MarketPrice::priceId($request->getPreferredLanguage(['en', 'pt-BR'])),
            recoveryKey: $recoveryKey,
            successUrl: route('prefix.claim') . '?session_id={CHECKOUT_SESSION_ID}',
            cancelUrl: route('home'),
        );

        return Inertia::location($session->url)
            ->withCookie(Cookie::make(
                PrefixController::CLAIM_COOKIE,
                $recoveryKey,
                PrefixController::CLAIM_COOKIE_LIFETIME_MINUTES,
            ));
    }

    public function webhook(Request $request): Response
    {
        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                (string) $request->header('Stripe-Signature'),
                (string) config('stripe.webhook_secret'),
            );
        } catch (SignatureVerificationException|UnexpectedValueException) {
            return response('', 400);
        }

        $sessionId = (string) ($event->data->object->id ?? '');
        $reservationId = (string) ($event->data->object->metadata['reservation'] ?? '');

        if (in_array($event->type, [
            'checkout.session.completed',
            'checkout.session.async_payment_succeeded',
        ], true)) {
            $this->grantAccess->execute($sessionId);
        }

        if (in_array($event->type, [
            'checkout.session.async_payment_failed',
            'checkout.session.expired',
        ], true)) {
            $this->releaseCheckout->execute($sessionId, $reservationId);
        }

        return response('', 204);
    }
}
