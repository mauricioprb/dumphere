<?php

declare(strict_types=1);

namespace App\Providers;

use App\Domain\Document\Actions\FindOrCreateDocument;
use App\Domain\Document\Actions\PersistDocumentContent;
use App\Domain\Document\Actions\PurgeStaleDocuments;
use Illuminate\Support\ServiceProvider;

class DocumentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(FindOrCreateDocument::class);
        $this->app->singleton(PersistDocumentContent::class);
        $this->app->singleton(PurgeStaleDocuments::class);
    }

    public function boot(): void
    {
        //
    }
}
