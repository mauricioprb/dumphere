export function useAppHost() {
    return window.location.host;
}

export function useContactEmail() {
    const configured = useRuntimeConfig().public.contactEmail?.trim();

    return configured || `contato@${window.location.host}`;
}
