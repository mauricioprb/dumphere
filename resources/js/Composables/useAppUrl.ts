import { computed } from 'vue';
import { usePage } from '@inertiajs/vue3';

export function useAppHost() {
    const page = usePage();

    return computed(() => {
        const appUrl = page.props.appUrl;

        if (typeof appUrl === 'string' && appUrl.trim() !== '') {
            try {
                return new URL(appUrl).host;
            } catch {
                return appUrl.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/\/+$/, '');
            }
        }

        return typeof window !== 'undefined' ? window.location.host : '';
    });
}

export function useContactEmail() {
    const page = usePage();
    const appHost = useAppHost();

    return computed(() => {
        const configured = page.props.contactEmail;

        if (typeof configured === 'string' && configured.trim() !== '') {
            return configured.trim();
        }

        return appHost.value ? `contato@${appHost.value}` : '';
    });
}
