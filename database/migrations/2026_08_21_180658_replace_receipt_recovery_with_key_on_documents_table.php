<?php

declare(strict_types=1);

use App\Support\RecoveryKey;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('checkout_claim_hash', 64)->nullable();
            $table->string('owner_recovery_key_hash', 64)->nullable();
        });

        DB::table('documents')
            ->select(['id', 'stripe_receipt_url'])
            ->whereNotNull('stripe_receipt_url')
            ->whereNull('owner_recovery_key_hash')
            ->orderBy('id')
            ->chunkById(100, function ($documents): void {
                foreach ($documents as $document) {
                    DB::table('documents')
                        ->where('id', $document->id)
                        ->update([
                            'owner_recovery_key_hash' => RecoveryKey::digest((string) $document->stripe_receipt_url),
                        ]);
                }
            });

        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('stripe_receipt_url');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['checkout_claim_hash', 'owner_recovery_key_hash']);
            $table->string('stripe_receipt_url')->nullable();
        });
    }
};
