<?php

declare(strict_types=1);

namespace Dumphere;

final class DocumentTree
{
    /**
     * @param iterable<array{slug: string, title: ?string}> $descendants
     * @return list<array{slug: string, label: string, hasChildren: bool, exists: bool}>
     */
    public static function children(string $slug, iterable $descendants): array
    {
        $children = [];
        $prefix = $slug . '/';

        foreach ($descendants as $descendant) {
            if (!str_starts_with($descendant['slug'], $prefix)) {
                continue;
            }

            [$segment, $nestedPath] = array_pad(explode('/', substr($descendant['slug'], strlen($prefix)), 2), 2, null);
            $childSlug = $prefix . $segment;

            $children[$childSlug] ??= [
                'slug' => $childSlug,
                'label' => self::headline($segment),
                'hasChildren' => false,
                'exists' => false,
            ];

            if ($nestedPath !== null) {
                $children[$childSlug]['hasChildren'] = true;

                continue;
            }

            $children[$childSlug]['exists'] = true;
            $children[$childSlug]['label'] = ($descendant['title'] ?? '') !== ''
                ? $descendant['title']
                : self::headline($segment);
        }

        ksort($children, SORT_STRING);

        return array_values($children);
    }

    public static function headline(string $segment): string
    {
        return ucwords(str_replace('-', ' ', $segment));
    }
}
