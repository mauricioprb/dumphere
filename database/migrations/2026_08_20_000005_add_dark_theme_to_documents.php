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
            // Light and dark are edited apart. Null in dark falls back to the light hue's complement.
            $table->smallInteger('theme_hue_dark')->nullable();
            $table->smallInteger('theme_chroma_dark')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['theme_hue_dark', 'theme_chroma_dark']);
        });
    }
};
