import '../css/app.css'
import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { createPinia } from 'pinia'
import type { DefineComponent } from 'vue'

const pages = import.meta.glob<DefineComponent>('./Pages/**/*.vue')

createInertiaApp({
    title: (title: string) => title ? `${title} - Dumphere` : 'Dumphere',
    resolve: (name: string) => {
        const page = pages[`./Pages/${name}.vue`]

        if (!page) {
            throw new Error(`Unknown Inertia page: ${name}`)
        }

        return page()
    },
    setup({ el, App, props, plugin }) {
        const pinia = createPinia()

        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(pinia)
            .mount(el)

        document.getElementById('app-loading')?.remove()
    },
    progress: {
        color: '#4B5563',
        delay: 100,
        showSpinner: false,
    },
})
