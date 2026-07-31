<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Domain\Document\Support\DocumentSlug;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class DocumentSlugTest extends TestCase
{
    #[DataProvider('validSlugs')]
    public function test_it_accepts_valid_slugs(string $slug): void
    {
        $this->assertTrue(DocumentSlug::isValid($slug));
    }

    #[DataProvider('invalidSlugs')]
    public function test_it_rejects_invalid_slugs(string $slug): void
    {
        $this->assertFalse(DocumentSlug::isValid($slug));
    }

    public static function validSlugs(): array
    {
        return [
            ['notes'],
            ['configuration-notes'],
            ['team/weekly/notes'],
            [str_repeat('a', DocumentSlug::MAX_LENGTH)],
        ];
    }

    public static function invalidSlugs(): array
    {
        return [
            [''],
            ['admin'],
            ['terms/privacy'],
            ['leading-/segment'],
            ['segment-/next'],
            ['one//two'],
            ['one/two/three/four/five'],
            [str_repeat('a', DocumentSlug::MAX_LENGTH + 1)],
        ];
    }
}
