<?php

declare(strict_types=1);

namespace App\Domain\Document\DTOs;

use App\Domain\Document\Models\Document;

class DocumentData
{
    public function __construct(
        public readonly string $id,
        public readonly string $slug,
        public readonly ?string $title,
        public readonly string $contentHtml,
        public readonly ?string $yjsStateBase64,
        public readonly string $updatedAt,
        public readonly string $createdAt,
    ) {}

    public static function fromModel(Document $document): self
    {
        return new self(
            id: $document->id,
            slug: $document->slug,
            title: $document->title,
            contentHtml: $document->content_html ?? '',
            yjsStateBase64: $document->yjs_state_base64,
            updatedAt: $document->updated_at->toISOString(),
            createdAt: $document->created_at->toISOString(),
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'contentHtml' => $this->contentHtml,
            'yjsStateBase64' => $this->yjsStateBase64,
            'updatedAt' => $this->updatedAt,
            'createdAt' => $this->createdAt,
        ];
    }
}
