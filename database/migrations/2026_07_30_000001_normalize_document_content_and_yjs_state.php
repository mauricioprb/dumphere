<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->longText('content_html')->nullable();
            $table->longText('yjs_state_base64')->nullable();
        });

        DB::table('documents')
            ->whereNull('content_html')
            ->update(['content_html' => DB::raw('markdown_content')]);
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('content_html');
            $table->dropColumn('yjs_state_base64');
        });
    }
};
