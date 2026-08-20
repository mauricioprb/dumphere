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
            $table->timestamp('paid_until')->nullable()->index();
            $table->boolean('readonly')->default(false);
            $table->string('visitor_password_hash')->nullable();
            $table->string('owner_password_hash')->nullable();
            $table->string('stripe_session_id')->nullable()->unique();
            $table->string('stripe_receipt_url')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn([
                'paid_until',
                'readonly',
                'visitor_password_hash',
                'owner_password_hash',
                'stripe_session_id',
                'stripe_receipt_url',
            ]);
        });
    }
};
