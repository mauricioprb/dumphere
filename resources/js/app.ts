import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { createPinia } from 'pinia'
import type { DefineComponent } from 'vue'

createInertiaApp({
    title: (title: string) => title ? `${title} — MD Editor` : 'MD Editor',
    resolve: (name: string) => {
        const pages = import.meta.glob<DefineComponent>('./Pages/**/*.vue', { eager: true })
        return pages[`./Pages/${name}.vue`]
    },
    setup({ el, App, props, plugin }) {
        const pinia = createPinia()

        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(pinia)
            .mount(el)
    },
    progress: {
        color: '#4B5563',
    },
})
