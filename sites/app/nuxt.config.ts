import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import tailwindcss from '@tailwindcss/vite';

const title = 'Dumphere — Collaborative Markdown editor';
const description =
    'Create and edit Markdown documents in real time, straight from the address, with no sign-up.';

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    ssr: false,
    devtools: { enabled: true },
    modules: ['@nuxt/eslint'],
    css: ['~/assets/css/app.css'],
    vite: { plugins: [tailwindcss()] },
    spaLoadingTemplate: true,
    experimental: { entryImportMap: false },
    hooks: {
        'nitro:init'(nitro) {
            nitro.hooks.hook('prerender:generate', (route) => {
                if (typeof route.contents !== 'string') return;

                route.contents = route.contents.replace(
                    /<script>(window\.__NUXT__=[\s\S]*?)<\/script>/,
                    (_, code: string) => {
                        const file = `_nuxt/config.${createHash('sha256').update(code).digest('hex').slice(0, 12)}.js`;

                        mkdirSync(join(nitro.options.output.publicDir, '_nuxt'), {
                            recursive: true,
                        });
                        writeFileSync(join(nitro.options.output.publicDir, file), code);

                        return `<script src="/${file}"></script>`;
                    },
                );
            });
        },
    },
    typescript: { tsConfig: { compilerOptions: { noUncheckedIndexedAccess: false } } },
    runtimeConfig: {
        public: {
            appwriteEndpoint: process.env.NUXT_PUBLIC_APPWRITE_ENDPOINT,
            appwriteProjectId: process.env.NUXT_PUBLIC_APPWRITE_PROJECT_ID,
            yjsUrl: process.env.NUXT_PUBLIC_YJS_URL,
            contactEmail: process.env.NUXT_PUBLIC_CONTACT_EMAIL,
        },
    },
    app: {
        head: {
            title,
            htmlAttrs: { lang: 'en', class: 'h-full' },
            bodyAttrs: { class: 'h-full antialiased' },
            meta: [
                { name: 'description', content: description },
                { name: 'theme-color', content: '#17181a' },
                { property: 'og:type', content: 'website' },
                { property: 'og:site_name', content: 'Dumphere' },
                { property: 'og:title', content: title },
                { property: 'og:description', content: description },
                { property: 'og:image', content: '/images/og/dumphere.png' },
                { property: 'og:image:alt', content: 'Dumphere — collaborative Markdown editor' },
                { name: 'twitter:card', content: 'summary_large_image' },
            ],
            link: [
                { rel: 'preconnect', href: 'https://fonts.bunny.net' },
                {
                    rel: 'stylesheet',
                    href: 'https://fonts.bunny.net/css?family=bricolage-grotesque:400,500,600,700|inter:400,500,600,700',
                },
                { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
                { rel: 'icon', href: '/images/logo/dumphere-mark.svg', type: 'image/svg+xml' },
                { rel: 'apple-touch-icon', href: '/images/logo/dumphere-apple-touch-icon.png' },
            ],
            script: [{ src: '/boot.js', tagPosition: 'head' }],
            noscript: [{ textContent: 'This application needs JavaScript to work.' }],
        },
    },
});
