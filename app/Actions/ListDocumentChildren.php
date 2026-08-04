<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\Document;
use Illuminate\Support\Str;

final class ListDocumentChildren
{
    /**
     * The slug arrives normalised and validated from the SanitizeSlug middleware.
     *
     * @return list<array{slug: string, label: string, hasChildren: bool, exists: bool}>
     */
    public function execute(string $slug): array
    {
        $children = [];
        $prefix = $slug . '/';

        $descendants = Document::query()
            ->select(['slug', 'title'])
            ->where('slug', '>=', $prefix)
            ->where('slug', '<', $prefix . '{')
            ->orderBy('slug')
            ->cursor();

        foreach ($descendants as $descendant) {
            [$segment, $nestedPath] = array_pad(explode('/', Str::after($descendant->slug, $prefix), 2), 2, null);
            $childSlug = $prefix . $segment;

            $children[$childSlug] ??= [
                'slug' => $childSlug,
                'label' => Str::headline($segment),
                'hasChildren' => false,
                'exists' => false,
            ];

            if ($nestedPath !== null) {
                $children[$childSlug]['hasChildren'] = true;

                continue;
            }

            $children[$childSlug]['exists'] = true;
            $children[$childSlug]['label'] = filled($descendant->title)
                ? (string) $descendant->title
                : Str::headline($segment);
        }

        return array_values($children);
    }
}
