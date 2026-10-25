import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = '.output/public';
const pages = readdirSync(root, { recursive: true }).filter((file) => file.endsWith('.html'));
const inline = pages.filter((file) =>
    [
        ...readFileSync(join(root, file), 'utf8').matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g),
    ].some(
        ([, attributes, body]) =>
            body.trim() !== '' && !/type="application\/(json|ld\+json)"/.test(attributes),
    ),
);

if (pages.length === 0 || inline.length > 0) {
    console.error(
        `Script inline bloqueado pela CSP em: ${inline.join(', ') || 'nenhuma página gerada'}`,
    );
    process.exit(1);
}
