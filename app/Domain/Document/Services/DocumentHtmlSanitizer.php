<?php

declare(strict_types=1);

namespace App\Domain\Document\Services;

use App\Domain\Document\Models\Document;
use App\Domain\Document\Support\TiptapAttributeSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerInterface;

final class DocumentHtmlSanitizer
{
    private readonly HtmlSanitizerInterface $sanitizer;

    public function __construct()
    {
        $config = (new HtmlSanitizerConfig)
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
            ->withAttributeSanitizer(new TiptapAttributeSanitizer)
            ->withMaxInputLength(Document::MAX_SIZE_BYTES);

        $this->sanitizer = new HtmlSanitizer($config);
    }

    public function sanitize(string $html): string
    {
        return $this->sanitizer->sanitize($html);
    }
}
