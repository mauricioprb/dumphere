<?php

declare(strict_types=1);

use Dumphere\DocumentTree;

it('groups descendants into direct children', function (): void {
    $children = DocumentTree::children('team', [
        ['slug' => 'team/weekly/notes', 'title' => 'Notes'],
        ['slug' => 'team/backlog', 'title' => 'Our backlog'],
        ['slug' => 'team/weekly', 'title' => null],
        ['slug' => 'teammates', 'title' => 'Elsewhere'],
    ]);

    expect($children)->toBe([
        ['slug' => 'team/backlog', 'label' => 'Our backlog', 'hasChildren' => false, 'exists' => true],
        ['slug' => 'team/weekly', 'label' => 'Weekly', 'hasChildren' => true, 'exists' => true],
    ]);
});

it('lists folders that only exist through their children', function (): void {
    expect(DocumentTree::children('a', [['slug' => 'a/b-c/d', 'title' => 'D']]))->toBe([
        ['slug' => 'a/b-c', 'label' => 'B C', 'hasChildren' => true, 'exists' => false],
    ]);
});
