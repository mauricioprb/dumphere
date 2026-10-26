<?php

declare(strict_types=1);

namespace Dumphere;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerInterface;

final class DocumentHtmlSanitizer
{
    public const MAX_SIZE_BYTES = 512_000;

    private readonly HtmlSanitizerInterface $sanitizer;

    public function __construct()
    {
        $config = (new HtmlSanitizerConfig())
            ->allowSafeElements()
            ->allowAttribute('class', ['code'])
            ->allowAttribute('colwidth', ['td', 'th'])
            ->allowAttribute('data-checked', ['li'])
            ->allowAttribute('data-type', ['li', 'ul'])
            ->allowAttribute('style', ['col', 'table', 'td', 'th'])
            ->allowLinkSchemes(['http', 'https', 'mailto', 'tel'])
            ->allowRelativeLinks()
            ->allowMediaSchemes(['http', 'https'])
            ->allowRelativeMedias()
            ->forceAttribute('a', 'rel', 'noopener noreferrer')
            ->withAttributeSanitizer(new TiptapAttributeSanitizer())
            ->withMaxInputLength(self::MAX_SIZE_BYTES);

        $this->sanitizer = new HtmlSanitizer($config);
    }

    public function sanitize(string $html): string
    {
        return $this->sanitizer->sanitize($html);
    }
}
