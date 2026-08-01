<!DOCTYPE html>
<html lang="pt-BR" class="h-full">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=bricolage-grotesque:400,500,600,700|inter:400,500,600,700" rel="stylesheet" />
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/images/logo/dumphere-mark.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/images/logo/dumphere-apple-touch-icon.png">
    <style nonce="{{ app('csp-nonce') }}">
        html,
        body {
            min-height: 100%;
            background: #faf8f5;
        }

        html.dark,
        html.dark body {
            background: #17181a;
        }

        #app-loading {
            position: fixed;
            inset: 0;
            display: grid;
            place-items: center;
            z-index: 200;
            background: #faf8f5;
            color: #1d1e1a;
        }

        html.dark #app-loading {
            background: #17181a;
            color: #f1efea;
        }

        #app-loading .page-loader-stage {
            display: grid;
            width: min(calc(100% - 2.5rem), 46rem);
            justify-items: center;
            gap: clamp(1.5rem, 3vw, 2.25rem);
        }

        #app-loading .page-loader-wordmark {
            display: flex;
            align-items: baseline;
            justify-content: center;
            column-gap: 0.08em;
            font-family: 'Bricolage Grotesque', 'Inter', sans-serif;
            font-size: clamp(3.5rem, 12vw, 6rem);
            font-weight: 700;
            line-height: 0.9;
            letter-spacing: -0.035em;
            white-space: nowrap;
        }

        #app-loading .page-loader-slash {
            display: inline-block;
            margin-left: 0.015em;
            color: #55701a;
        }

        html.dark #app-loading .page-loader-slash {
            color: #a3c765;
        }

        #app-loading .page-loader-selection {
            position: relative;
            display: inline-block;
            box-sizing: border-box;
            padding: 0.015em 0.085em 0.055em 0.06em;
        }

        #app-loading .page-loader-selection__text,
        #app-loading .page-loader-selection__fill {
            white-space: nowrap;
        }

        #app-loading .page-loader-selection__fill {
            position: absolute;
            inset: 0;
            box-sizing: border-box;
            overflow: hidden;
            padding: inherit;
            animation: boot-loader-selection 1.65s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            background: #dde8bf;
            color: #232b17;
            clip-path: inset(0 100% 0 0);
        }

        html.dark #app-loading .page-loader-selection__fill {
            background: #3c4d26;
            color: #e9f0d8;
        }

        #app-loading .page-loader-status {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            padding-top: 0.8rem;
            border-top: 1px solid #dcdcd2;
        }

        html.dark #app-loading .page-loader-status {
            border-color: #34373a;
        }

        #app-loading .page-loader-status__signal {
            width: 0.5rem;
            height: 0.5rem;
            background: #55701a;
        }

        html.dark #app-loading .page-loader-status__signal {
            background: #a3c765;
        }

        #app-loading .page-loader-label {
            color: #5d5f57;
            font-family: 'Bricolage Grotesque', sans-serif;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.025em;
        }

        html.dark #app-loading .page-loader-label {
            color: #a8aaa4;
        }

        #app-loading .page-loader-label-en {
            display: none;
        }

        html[lang='en'] #app-loading .page-loader-label-pt {
            display: none;
        }

        html[lang='en'] #app-loading .page-loader-label-en {
            display: inline;
        }

        @keyframes boot-loader-selection {
            0%,
            12% {
                clip-path: inset(0 100% 0 0);
            }

            50%,
            72% {
                clip-path: inset(0);
            }

            100% {
                clip-path: inset(0 0 0 100%);
            }
        }

        @media (prefers-reduced-motion: reduce) {
            #app-loading .page-loader-selection__fill {
                animation: none;
                clip-path: inset(0);
            }

        }
    </style>
    @vite(['resources/css/app.css', 'resources/js/app.ts'])
    @php($seo = $page['props']['seo'] ?? \App\Support\SeoMetadata::forRequest(request()))
    <x-inertia::head>
        <title>{{ $seo['title'] }}</title>
        <meta name="description" content="{{ $seo['description'] }}">
        <meta name="robots" content="{{ $seo['robots'] }}">
        <meta name="theme-color" content="{{ $seo['themeColor'] }}">
        <link rel="canonical" href="{{ $seo['canonicalUrl'] }}">
        <link rel="sitemap" type="application/xml" href="{{ $seo['sitemapUrl'] }}">

        <meta property="og:type" content="{{ $seo['type'] }}">
        <meta property="og:site_name" content="{{ $seo['siteName'] }}">
        <meta property="og:title" content="{{ $seo['title'] }}">
        <meta property="og:description" content="{{ $seo['description'] }}">
        <meta property="og:url" content="{{ $seo['canonicalUrl'] }}">
        <meta property="og:locale" content="{{ $seo['locale'] }}">
        <meta property="og:image" content="{{ $seo['imageUrl'] }}">
        <meta property="og:image:type" content="{{ $seo['imageType'] }}">
        <meta property="og:image:width" content="{{ $seo['imageWidth'] }}">
        <meta property="og:image:height" content="{{ $seo['imageHeight'] }}">
        <meta property="og:image:alt" content="{{ $seo['imageAlt'] }}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $seo['title'] }}">
        <meta name="twitter:description" content="{{ $seo['description'] }}">
        <meta name="twitter:image" content="{{ $seo['imageUrl'] }}">
        <meta name="twitter:image:alt" content="{{ $seo['imageAlt'] }}">

        @if (is_array($seo['structuredData']))
            <script type="application/ld+json" nonce="{{ app('csp-nonce') }}">@json($seo['structuredData'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT)</script>
        @endif
    </x-inertia::head>
    <script nonce="{{ app('csp-nonce') }}">
        (function() {
            const storedLocale = localStorage.getItem('md-editor-locale');
            const locale = storedLocale === 'pt-BR' || storedLocale === 'en'
                ? storedLocale
                : (navigator.language.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en');
            document.documentElement.lang = locale;
            document.documentElement.dir = 'ltr';

            const t = localStorage.getItem('md-editor-theme');
            if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            }
        })();
    </script>
</head>

<body class="h-full antialiased">

    <div id="app-loading" role="status" aria-live="polite" aria-atomic="true">
        <div class="page-loader-stage">
            <div class="page-loader-wordmark" translate="no" aria-hidden="true">
                <span>dump<span class="page-loader-slash">/</span></span>
                <span class="page-loader-selection">
                    <span class="page-loader-selection__text">here</span>
                    <span class="page-loader-selection__fill">here</span>
                </span>
            </div>

            <div class="page-loader-status">
                <span class="page-loader-status__signal" aria-hidden="true"></span>
                <span class="page-loader-label page-loader-label-pt" lang="pt-BR">Carregando página...</span>
                <span class="page-loader-label page-loader-label-en" lang="en">Loading page...</span>
            </div>
        </div>
    </div>
    @inertia
    <noscript>Esta aplicação precisa de JavaScript para funcionar.</noscript>
</body>

</html>
