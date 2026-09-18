import 'vite/client';

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent;
    export default component;
}

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_YJS_WS_HOST: string;
    readonly VITE_YJS_WS_PORT: string;
    readonly VITE_YJS_WS_SCHEME: string;
    readonly VITE_YJS_WS_PATH: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
    glob<T>(pattern: string, options?: { eager?: boolean }): Record<string, T>;
}
