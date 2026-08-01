const MAX_LENGTH = 100;
const MAX_SEGMENTS = 4;

const RESERVED_FIRST_SEGMENTS = new Set([
    'admin',
    'api',
    'assets',
    'broadcasting',
    'build',
    'dashboard',
    'favicon',
    'health',
    'login',
    'register',
    'reverb',
    'robots',
    'settings',
    'sitemap',
    'terms',
    'up',
    'vendor',
]);

export function normalizeDocumentPath(value: string): string | null {
    const segments = value
        .trim()
        .replace(/^\/+|\/+$/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .split('/')
        .map((segment) =>
            segment
                .trim()
                .replace(/[\s_]+/g, '-')
                .replace(/[^a-z0-9-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, ''),
        );

    if (
        segments.length === 0 ||
        segments.length > MAX_SEGMENTS ||
        segments.some((segment) => segment.length === 0) ||
        RESERVED_FIRST_SEGMENTS.has(segments[0])
    ) {
        return null;
    }

    const path = segments.join('/');

    return path.length <= MAX_LENGTH ? path : null;
}
