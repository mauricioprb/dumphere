<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite will not drop a column while an index still points at it.
        Schema::table('documents', function (Blueprint $table) {
            $table->dropUnique(['stripe_session_id']);
            $table->dropUnique(['checkout_reservation_id']);
            $table->dropUnique(['checkout_session_id']);
            $table->dropIndex(['checkout_reserved_until']);
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_session_id',
                'checkout_reservation_id',
                'checkout_reserved_until',
                'checkout_session_id',
                'checkout_claim_hash',
            ]);
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->renameColumn('paid_until', 'reserved_until');
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->renameColumn('reserved_until', 'paid_until');
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->string('stripe_session_id')->nullable()->unique();
            $table->uuid('checkout_reservation_id')->nullable()->unique();
            $table->timestamp('checkout_reserved_until')->nullable()->index();
            $table->string('checkout_session_id')->nullable()->unique();
            $table->string('checkout_claim_hash', 64)->nullable();
        });
    }
};
