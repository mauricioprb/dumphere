<!DOCTYPE html>
<html lang="pt-BR" class="h-full">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title data-inertia>Dumphere</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700" rel="stylesheet" />
    <link rel="icon" type="image/svg+xml"
        href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📝</text></svg>">
    <style nonce="{{ app('csp-nonce') }}">
        html, body { min-height: 100%; background: #fff; }
        html.dark, html.dark body { background: #171717; }
        #app-loading {
            position: fixed;
            inset: 0;
            display: grid;
            place-items: center;
            color: #737373;
            font: 14px/1.5 Inter, ui-sans-serif, system-ui, sans-serif;
        }
        html.dark #app-loading { color: #a3a3a3; }
    </style>
    @vite(['resources/css/app.css', 'resources/js/app.ts'])
    @inertiaHead
    <script nonce="{{ app('csp-nonce') }}">
        (function() {
            const t = localStorage.getItem('md-editor-theme');
            if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            }
        })();
    </script>
</head>

<body class="h-full antialiased">
    <div id="app-loading" role="status" aria-live="polite">Carregando...</div>
    @inertia
    <noscript>Esta aplicação precisa de JavaScript para funcionar.</noscript>
</body>

</html>
