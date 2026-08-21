<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Document;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

final class ReleasePrefixCheckout
{
    public function execute(string $sessionId, ?string $reservationId = null): void
    {
        DB::transaction(function () use ($sessionId, $reservationId): void {
            $document = Document::query()
                ->where(function (Builder $query) use ($sessionId, $reservationId): void {
                    $query->where('checkout_session_id', $sessionId);

                    if ($reservationId !== null && $reservationId !== '') {
                        $query->orWhere('checkout_reservation_id', $reservationId);
                    }
                })
                ->lockForUpdate()
                ->first();

            if ($document === null || $document->stripe_session_id === $sessionId) {
                return;
            }

            if ($document->checkout_session_id !== $sessionId
                && ($reservationId === null
                    || ! hash_equals((string) $document->checkout_reservation_id, $reservationId))) {
                return;
            }

            $document->forceFill([
                'checkout_claim_hash' => null,
                'checkout_reservation_id' => null,
                'checkout_reserved_until' => null,
                'checkout_session_id' => null,
            ])->save();
        }, attempts: 5);
    }
}
