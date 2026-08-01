import '../css/app.css';
import { createApp, Fragment, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { createPinia } from 'pinia';
import type { DefineComponent } from 'vue';
import PageLoader from '@/Components/UI/PageLoader.vue';

const pages = import.meta.glob<DefineComponent>('./Pages/**/*.vue');

createInertiaApp({
    title: (title: string) => (title ? `${title} - Dumphere` : 'Dumphere'),
    resolve: (name: string) => {
        const page = pages[`./Pages/${name}.vue`];

        if (!page) {
            throw new Error(`Unknown Inertia page: ${name}`);
        }

        return page();
    },
    setup({ el, App, props, plugin }) {
        const pinia = createPinia();

        createApp({
            render: () => h(Fragment, [h(App, props), h(PageLoader)]),
        })
            .use(plugin)
            .use(pinia)
            .mount(el);

        document.getElementById('app-loading')?.remove();
    },
    progress: false,
});
