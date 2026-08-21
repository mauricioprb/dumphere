<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->uuid('checkout_reservation_id')->nullable()->unique();
            $table->timestamp('checkout_reserved_until')->nullable()->index();
            $table->string('checkout_session_id')->nullable()->unique();
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn([
                'checkout_reservation_id',
                'checkout_reserved_until',
                'checkout_session_id',
            ]);
        });
    }
};
