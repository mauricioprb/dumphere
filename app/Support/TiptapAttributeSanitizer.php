<?php

declare(strict_types=1);

namespace App\Support;

use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;
use Symfony\Component\HtmlSanitizer\Visitor\AttributeSanitizer\AttributeSanitizerInterface;

final class TiptapAttributeSanitizer implements AttributeSanitizerInterface
{
    public function getSupportedElements(): ?array
    {
        return ['code', 'col', 'li', 'table', 'td', 'th', 'ul'];
    }

    public function getSupportedAttributes(): ?array
    {
        return ['class', 'colwidth', 'data-checked', 'data-type', 'style'];
    }

    public function sanitizeAttribute(
        string $element,
        string $attribute,
        string $value,
        HtmlSanitizerConfig $config,
    ): ?string {
        return match ($attribute) {
            'class' => $this->sanitizeCodeLanguage($element, $value),
            'colwidth' => $this->sanitizeColumnWidths($element, $value),
            'data-checked' => $element === 'li' && in_array($value, ['true', 'false'], true)
                ? $value
                : null,
            'data-type' => match ($element) {
                'ul' => $value === 'taskList' ? $value : null,
                'li' => $value === 'taskItem' ? $value : null,
                default => null,
            },
            'style' => $this->sanitizeTableStyle($element, $value),
            default => null,
        };
    }

    private function sanitizeCodeLanguage(string $element, string $value): ?string
    {
        if ($element !== 'code') {
            return null;
        }

        return preg_match('/^language-[a-z0-9][a-z0-9_-]{0,49}$/i', $value) === 1
            ? strtolower($value)
            : null;
    }

    private function sanitizeColumnWidths(string $element, string $value): ?string
    {
        if (! in_array($element, ['td', 'th'], true) || preg_match('/^\d{1,5}(?:,\d{1,5})*$/', $value) !== 1) {
            return null;
        }

        foreach (explode(',', $value) as $width) {
            if ((int) $width < 1 || (int) $width > 10_000) {
                return null;
            }
        }

        return $value;
    }

    private function sanitizeTableStyle(string $element, string $value): ?string
    {
        if (! in_array($element, ['col', 'table', 'td', 'th'], true)) {
            return null;
        }

        $safeDeclarations = [];

        foreach (explode(';', $value) as $declaration) {
            $declaration = trim($declaration);

            if ($declaration === '') {
                continue;
            }

            if (preg_match('/^(width|min-width):\s*(\d{1,5}(?:\.\d{1,2})?)px$/i', $declaration, $match) === 1) {
                $pixels = (float) $match[2];

                if ($pixels >= 1 && $pixels <= 10_000) {
                    $safeDeclarations[] = strtolower($match[1]) . ': ' . $match[2] . 'px';
                }

                continue;
            }

            if (
                in_array($element, ['td', 'th'], true)
                && preg_match('/^text-align:\s*(left|center|right|justify)$/i', $declaration, $match) === 1
            ) {
                $safeDeclarations[] = 'text-align: ' . strtolower($match[1]);
            }
        }

        return $safeDeclarations === [] ? null : implode('; ', array_unique($safeDeclarations));
    }
}
