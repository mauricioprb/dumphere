<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('slug', 200)->unique()->index();
            $table->string('title', 255)->nullable();
            $table->longText('markdown_content')->nullable();
            $table->json('yjs_state')->nullable(); // Serialized Yjs Y.Doc state
            $table->timestamp('last_accessed_at')->nullable()->index();
            $table->timestamps();

            // Index for purge query
            $table->index(['last_accessed_at', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
