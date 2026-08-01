<!DOCTYPE html>
<html lang="pt-BR" class="h-full">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title data-inertia>Dumphere</title>
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
            background: #15130f;
        }

        #app-loading {
            position: fixed;
            inset: 0;
            display: grid;
            place-items: center;
            z-index: 200;
            background: #faf8f5;
            color: #1f1c19;
        }

        html.dark #app-loading {
            background: #15130f;
            color: #f3efe8;
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
            color: #d75f2b;
        }

        html.dark #app-loading .page-loader-slash {
            color: #ef7d4c;
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
            background: #ed8741;
            color: #351504;
            clip-path: inset(0 100% 0 0);
        }

        html.dark #app-loading .page-loader-selection__fill {
            background: #f08a43;
            color: #2d1204;
        }

        #app-loading .page-loader-status {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            padding-top: 0.8rem;
            border-top: 1px solid #ded8d0;
        }

        html.dark #app-loading .page-loader-status {
            border-color: #3b352e;
        }

        #app-loading .page-loader-status__signal {
            width: 0.5rem;
            height: 0.5rem;
            background: #587314;
        }

        html.dark #app-loading .page-loader-status__signal {
            background: #9fc85b;
        }

        #app-loading .page-loader-label {
            color: #615a52;
            font-family: 'Bricolage Grotesque', sans-serif;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.025em;
        }

        html.dark #app-loading .page-loader-label {
            color: #b1a89e;
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
    @inertiaHead
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
