<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $preferred = (string) $request->getPreferredLanguage(['en', 'pt-BR']);

        App::setLocale(str_starts_with(strtolower($preferred), 'pt') ? 'pt_BR' : 'en');

        return $next($request);
    }
}
