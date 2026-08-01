<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\SeoMetadata;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'appUrl' => config('app.url'),
            'contactEmail' => config('app.contact_email'),
            'seo' => SeoMetadata::forRequest($request),
        ];
    }
}
