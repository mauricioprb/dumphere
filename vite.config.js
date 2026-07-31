import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = {
        ...loadEnv(mode, process.cwd(), ''),
        ...process.env,
    };
    const appOrigin = new URL(env.APP_URL || 'http://localhost:8000').origin;
    const viteHost = env.VITE_DEV_SERVER_HOST || 'localhost';
    const vitePort = Number(env.VITE_PORT || 5173);
    const viteOrigin = `http://${viteHost}:${vitePort}`;

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.ts'],
                refresh: true,
            }),
            vue({
                template: {
                    transformAssetUrls: {
                        base: null,
                        includeAbsolute: false,
                    },
                },
            }),
            tailwindcss(),
        ],
        resolve: {
            alias: {
                '@': '/resources/js',
            },
        },
        build: {
            rolldownOptions: {
                output: {
                    codeSplitting: {
                        groups: [
                            {
                                name: 'collaboration',
                                test: /node_modules[\\/](?:@tiptap[\\/](?:extension-collaboration|extension-collaboration-caret|y-tiptap)|yjs|y-websocket|y-indexeddb)(?:[\\/]|$)/,
                                priority: 30,
                            },
                            {
                                name: 'editor',
                                test: /node_modules[\\/]@tiptap[\\/](?:vue-3|starter-kit|extension-(?:placeholder|task-list|task-item|highlight|typography|underline|link|superscript|subscript|table|character-count)|suggestion)(?:[\\/]|$)/,
                                priority: 20,
                            },
                            {
                                name: 'vue-vendor',
                                test: /node_modules[\\/](?:vue|@vue|@inertiajs[\\/]vue3|pinia)(?:[\\/]|$)/,
                                priority: 15,
                            },
                            {
                                name: 'syntax-highlighting',
                                test: /node_modules[\\/]lowlight(?:[\\/]|$)/,
                                priority: 10,
                            },
                            {
                                name: 'editor-floating-ui',
                                test: /node_modules[\\/]tippy\.js(?:[\\/]|$)/,
                                priority: 10,
                            },
                        ],
                    },
                },
            },
        },
        server: {
            host: viteHost,
            port: vitePort,
            strictPort: true,
            origin: viteOrigin,
            cors: {
                origin: appOrigin,
            },
            hmr: {
                host: viteHost,
                port: vitePort,
            },
            watch: {
                ignored: ['**/storage/framework/views/**'],
            },
        },
    };
});
