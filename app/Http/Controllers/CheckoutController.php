<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\GrantPrefixAccess;
use App\Models\Document;
use App\Support\DocumentSlug;
use App\Support\MarketPrice;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use UnexpectedValueException;

class CheckoutController
{
    public function __construct(
        private readonly StripeClient $stripe,
        private readonly GrantPrefixAccess $grantAccess,
    ) {}

    public function create(Request $request): SymfonyResponse
    {
        $prefix = DocumentSlug::normalize((string) $request->input('prefix'));

        if (str_contains($prefix, '/') || ! DocumentSlug::isValid($prefix)) {
            throw ValidationException::withMessages(['prefix' => __('prefix.address_unavailable')]);
        }

        if (Document::prefixOwner($prefix) !== null) {
            throw ValidationException::withMessages(['prefix' => __('prefix.address_taken')]);
        }

        $claim = Str::random(40);

        $session = $this->stripe->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => [
                ['price' => MarketPrice::priceId($request->getPreferredLanguage(['en', 'pt-BR'])), 'quantity' => 1],
            ],
            'success_url' => route('prefix.claim') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('home'),
            'metadata' => ['prefix' => $prefix, 'claim' => $claim],
            'client_reference_id' => $prefix,
        ]);

        return Inertia::location($session->url)
            ->withCookie(Cookie::make(PrefixController::CLAIM_COOKIE, $claim, 60));
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

        if ($event->type === 'checkout.session.completed') {
            $this->grantAccess->execute($event->data->object->id);
        }

        return response('', 204);
    }
}
