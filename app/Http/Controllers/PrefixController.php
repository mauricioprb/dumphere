<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\GrantPrefixAccess;
use App\Models\Document;
use App\Support\DocumentSlug;
use App\Support\PrefixCookie;
use App\Support\RecoveryKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PrefixController
{
    public const CLAIM_COOKIE = 'dh_claim';

    public const CLAIM_COOKIE_LIFETIME_MINUTES = 60 * 24 * 30;

    public function __construct(private readonly GrantPrefixAccess $grantAccess) {}

    public function claim(Request $request): Response
    {
        $sessionId = (string) $request->query('session_id');
        $recoveryKey = (string) $request->cookie(self::CLAIM_COOKIE, '');
        $document = $this->grantAccess->execute($sessionId, $recoveryKey);

        if ($document === null) {
            $pending = Document::where('checkout_session_id', $sessionId)->first();

            abort_unless($pending !== null
                && RecoveryKey::matches($recoveryKey, $pending->checkout_claim_hash), 404);

            return Inertia::render('Prefix/Claim', [
                'prefix' => $pending->slug,
                'sessionId' => $sessionId,
                'alreadyClaimed' => false,
                'recoveryKey' => '',
                'pending' => true,
            ]);
        }

        abort_unless(RecoveryKey::matches($recoveryKey, $document->owner_recovery_key_hash), 404);

        return Inertia::render('Prefix/Claim', [
            'prefix' => $document->slug,
            'sessionId' => $document->stripe_session_id,
            'alreadyClaimed' => $document->owner_password_hash !== null,
            'recoveryKey' => $recoveryKey,
            'pending' => false,
        ]);
    }

    public function storeOwnerPassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'session_id' => ['required', 'string'],
            'password' => ['required', 'string', 'max:200', 'confirmed'],
        ]);

        $document = Document::where('stripe_session_id', $validated['session_id'])->firstOrFail();
        $recoveryKey = (string) $request->cookie(self::CLAIM_COOKIE, '');

        abort_unless(RecoveryKey::matches($recoveryKey, $document->owner_recovery_key_hash), 404);

        if ($document->owner_password_hash !== null) {
            throw ValidationException::withMessages(['password' => __('prefix.already_claimed')]);
        }

        $document->forceFill(['owner_password_hash' => Hash::make($validated['password'])])->save();

        return redirect('/' . $document->slug)
            ->withCookie(PrefixCookie::claim($document->fresh()));
    }

    public function settings(Request $request, string $slug): JsonResponse
    {
        $document = Document::prefixOwner($slug);

        abort_if($document === null, 404);

        $carriesCookie = PrefixCookie::held($request, $document, PrefixCookie::OWNER);

        if (! $carriesCookie) {
            $validated = $request->validate([
                'password' => ['required', 'string'],
                'apply' => ['sometimes', 'boolean'],
            ]);

            if ($document->owner_password_hash === null
                || ! Hash::check($validated['password'], $document->owner_password_hash)) {
                throw ValidationException::withMessages(['password' => __('prefix.wrong_owner_password')]);
            }
        }

        if ($request->boolean('apply')) {
            $changes = $request->validate([
                'readonly' => ['required', 'boolean'],
                'theme_hue' => ['sometimes', 'nullable', 'integer', 'between:0,359'],
                'theme_chroma' => ['sometimes', 'nullable', 'integer', 'between:0,100'],
                'theme_hue_dark' => ['sometimes', 'nullable', 'integer', 'between:0,359'],
                'theme_chroma_dark' => ['sometimes', 'nullable', 'integer', 'between:0,100'],
                'visitor_password' => ['nullable', 'string', 'max:200'],
                'clear_visitor_password' => ['required', 'boolean'],
            ]);

            $wantsPassword = ! $changes['clear_visitor_password'];
            $keepsExisting = $document->visitor_password_hash !== null;

            if ($wantsPassword && ! $keepsExisting && blank($changes['visitor_password'] ?? null)) {
                throw ValidationException::withMessages([
                    'visitor_password' => __('prefix.visitor_password_required'),
                ]);
            }

            $document->forceFill([
                'readonly' => $changes['readonly'],
                'theme_hue' => array_key_exists('theme_hue', $changes)
                    ? $changes['theme_hue']
                    : $document->theme_hue,
                'theme_chroma' => array_key_exists('theme_chroma', $changes)
                    ? $changes['theme_chroma']
                    : $document->theme_chroma,
                'theme_hue_dark' => array_key_exists('theme_hue_dark', $changes)
                    ? $changes['theme_hue_dark']
                    : $document->theme_hue_dark,
                'theme_chroma_dark' => array_key_exists('theme_chroma_dark', $changes)
                    ? $changes['theme_chroma_dark']
                    : $document->theme_chroma_dark,
                'visitor_password_hash' => match (true) {
                    $changes['clear_visitor_password'] => null,
                    filled($changes['visitor_password'] ?? null) => Hash::make($changes['visitor_password']),
                    default => $document->visitor_password_hash,
                },
            ])->save();

            $document->refresh();

            $document->announceRulesChanged();
        }

        return response()->json([
            'prefix' => $document->slug,
            'readonly' => $document->readonly,
            'hasVisitorPassword' => $document->visitor_password_hash !== null,
            'themeHue' => $document->theme_hue,
            'themeChroma' => $document->theme_chroma,
            'themeHueDark' => $document->theme_hue_dark,
            'themeChromaDark' => $document->theme_chroma_dark,
            'paidUntil' => $document->paid_until?->toISOString(),
        ])->withCookie($carriesCookie
            ? PrefixCookie::issue($document, PrefixCookie::OWNER)
            : PrefixCookie::claim($document));
    }

    public function recoverForm(): Response
    {
        return Inertia::render('Prefix/Recover');
    }

    public function recover(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'prefix' => ['required', 'string'],
            'recovery_key' => ['required', 'string', 'max:200'],
            'password' => ['required', 'string', 'max:200', 'confirmed'],
        ]);

        $document = Document::prefixOwner(DocumentSlug::normalize($validated['prefix']));

        if ($document === null
            || ! RecoveryKey::matches(trim($validated['recovery_key']), $document->owner_recovery_key_hash)) {
            throw ValidationException::withMessages(['recovery_key' => __('prefix.recovery_key_mismatch')]);
        }

        $document->forceFill(['owner_password_hash' => Hash::make($validated['password'])])->save();

        return redirect('/' . $document->slug)
            ->withCookie(PrefixCookie::claim($document->fresh()));
    }
}
