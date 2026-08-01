<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

final class SeoMetadata
{
    /** @return array<string, mixed> */
    public static function forRequest(Request $request): array
    {
        if ($request->routeIs('terms')) {
            return self::build(
                request: $request,
                title: (string) config('seo.terms.title'),
                description: (string) config('seo.terms.description'),
                schemaType: 'WebPage',
            );
        }

        if ($request->routeIs('document.show')) {
            $slug = (string) $request->route('slug');

            return self::forDocument($request, Str::of($slug)->replace('/', ' / ')->headline()->toString());
        }

        return self::build(
            request: $request,
            title: (string) config('seo.home.title'),
            description: (string) config('seo.home.description'),
            schemaType: 'WebApplication',
        );
    }

    /** @return array<string, mixed> */
    public static function forDocument(Request $request, string $title): array
    {
        return self::build(
            request: $request,
            title: Str::of($title)->trim()->append(' — ', (string) config('seo.site_name'))->toString(),
            description: (string) config('seo.document.description'),
            robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
            schemaType: null,
        );
    }

    /** @return array<string, mixed> */
    private static function build(
        Request $request,
        string $title,
        string $description,
        string $robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        ?string $schemaType = null,
    ): array {
        $appUrl = rtrim((string) config('app.url'), '/');
        $requestPath = $request->getPathInfo();
        $canonicalUrl = $appUrl . ($requestPath === '/' ? '' : $requestPath);
        $imageUrl = $appUrl . '/' . ltrim((string) config('seo.image_path'), '/');
        $siteName = (string) config('seo.site_name');

        return [
            'title' => $title,
            'description' => $description,
            'canonicalUrl' => $canonicalUrl,
            'imageUrl' => $imageUrl,
            'imageAlt' => (string) config('seo.image_alt'),
            'imageWidth' => 1200,
            'imageHeight' => 630,
            'imageType' => 'image/png',
            'locale' => (string) config('seo.locale'),
            'robots' => $robots,
            'siteName' => $siteName,
            'themeColor' => (string) config('seo.theme_color'),
            'type' => 'website',
            'sitemapUrl' => $appUrl . '/sitemap.xml',
            'structuredData' => $schemaType === null ? null : [
                '@context' => 'https://schema.org',
                '@type' => $schemaType,
                'name' => $siteName,
                'url' => $canonicalUrl,
                'description' => $description,
                'image' => $imageUrl,
                ...($schemaType === 'WebApplication' ? [
                    'applicationCategory' => 'ProductivityApplication',
                    'operatingSystem' => 'Any',
                ] : []),
            ],
        ];
    }
}
