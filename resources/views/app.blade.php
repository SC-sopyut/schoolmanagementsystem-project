<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            #page-load-screen {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: #020617;
                color: white;
                opacity: 1;
                transition: opacity 300ms ease;
            }

            #page-load-screen.is-hidden {
                opacity: 0;
                pointer-events: none;
            }

            #page-load-screen img {
                width: 64px;
                height: 64px;
                margin-bottom: 16px;
                object-fit: contain;
            }

            #page-load-screen p {
                margin-top: 16px;
                font: 500 14px sans-serif;
            }

            .page-loader-spinner {
                width: 32px;
                height: 32px;
                border: 4px solid rgb(255 255 255 / 30%);
                border-top-color: #6366f1;
                border-radius: 50%;
                animation: page-loader-spin 800ms linear infinite;
            }

            @keyframes page-loader-spin {
                to { transform: rotate(360deg); }
            }

            @media (prefers-reduced-motion: reduce) {
                #page-load-screen { transition: none; }
                .page-loader-spinner { animation-duration: 1600ms; }
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />

        <div id="page-load-screen" role="status" aria-live="polite">
            <img src="/images/councilforge-logo.png" alt="">
            <div class="page-loader-spinner"></div>
            <p>Loading...</p>
        </div>

        <script>
            window.addEventListener('load', () => {
                const loader = document.getElementById('page-load-screen');

                if (!loader) return;

                requestAnimationFrame(() => loader.classList.add('is-hidden'));
                setTimeout(() => loader.remove(), 350);
            }, { once: true });
        </script>
    </body>
</html>
