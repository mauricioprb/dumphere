import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
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
        rollupOptions: {
            output: {
                manualChunks: {
                    'editor': [
                        '@tiptap/vue-3',
                        '@tiptap/starter-kit',
                        '@tiptap/extension-collaboration',
                        '@tiptap/extension-collaboration-cursor',
                        '@tiptap/extension-placeholder',
                        '@tiptap/extension-task-list',
                        '@tiptap/extension-task-item',
                        '@tiptap/extension-highlight',
                        '@tiptap/extension-typography',
                        '@tiptap/extension-underline',
                        '@tiptap/extension-link',
                        '@tiptap/extension-superscript',
                        '@tiptap/extension-subscript',
                        '@tiptap/extension-table',
                        '@tiptap/extension-character-count',
                        '@tiptap/suggestion',
                        'tippy.js',
                        'yjs', 'y-websocket', 'y-prosemirror', 'y-indexeddb', 'lib0',
                    ],
                    'vue-vendor': ['vue', '@inertiajs/vue3', 'pinia'],
                },
            },
        },
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
