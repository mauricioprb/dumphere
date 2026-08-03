<?php

declare(strict_types=1);

use App\Models\Document;

function createTreeDocument(string $slug, ?string $title = null): Document
{
    return Document::create([
        'slug' => $slug,
        'title' => $title ?? str($slug)->afterLast('/')->headline()->toString(),
        'content_html' => '',
    ]);
}

it('lists direct and implicit children without exposing unrelated trees', function (): void {
    createTreeDocument('overclock');
    createTreeDocument('overclock/notas');
    createTreeDocument('overclock/notas/2026');
    createTreeDocument('overclock/pesquisa/resultados');
    createTreeDocument('overclock/projetos', 'Projetos ativos');
    createTreeDocument('overclock/projetos/api');
    createTreeDocument('unrelated/private');

    $this->getJson('/api/document-tree/overclock')
        ->assertOk()
        ->assertExactJson([
            'children' => [
                [
                    'slug' => 'overclock/notas',
                    'label' => 'Notas',
                    'hasChildren' => true,
                    'exists' => true,
                ],
                [
                    'slug' => 'overclock/pesquisa',
                    'label' => 'Pesquisa',
                    'hasChildren' => true,
                    'exists' => false,
                ],
                [
                    'slug' => 'overclock/projetos',
                    'label' => 'Projetos ativos',
                    'hasChildren' => true,
                    'exists' => true,
                ],
            ],
        ]);
});

it('loads one branch at a time', function (): void {
    createTreeDocument('overclock/projetos');
    createTreeDocument('overclock/projetos/api');
    createTreeDocument('overclock/projetos/app/mobile');
    createTreeDocument('overclock/notas');

    $this->getJson('/api/document-tree/overclock/projetos')
        ->assertOk()
        ->assertExactJson([
            'children' => [
                [
                    'slug' => 'overclock/projetos/api',
                    'label' => 'Api',
                    'hasChildren' => false,
                    'exists' => true,
                ],
                [
                    'slug' => 'overclock/projetos/app',
                    'label' => 'App',
                    'hasChildren' => true,
                    'exists' => false,
                ],
            ],
        ]);
});

it('does not create or mark documents as accessed while browsing the tree', function (): void {
    $document = createTreeDocument('overclock/projetos');

    $this->getJson('/api/document-tree/overclock')->assertOk();

    expect(Document::count())
        ->toBe(1)
        ->and($document->fresh()->last_accessed_at)
        ->toBeNull();
});

it('rejects invalid tree paths', function (): void {
    $this->getJson('/api/document-tree/overclock//projetos')->assertNotFound();
    $this->getJson('/api/document-tree/terms')->assertNotFound();
});
