<?php

declare(strict_types=1);

namespace App\Domain\Document\DTOs;

class DocumentData
{
    public function __construct(
        public readonly string $id,
        public readonly string $slug,
        public readonly ?string $title,
        public readonly string $markdownContent,
        public readonly ?string $yjsStateBase64,
        public readonly string $updatedAt,
    ) {}

    public static function fromModel(\App\Domain\Document\Models\Document $document): self
    {
        return new self(
            id: $document->id,
            slug: $document->slug,
            title: $document->title,
            markdownContent: $document->markdown_content ?? '',
            yjsStateBase64: $document->yjs_state ? base64_encode(json_encode($document->yjs_state)) : null,
            updatedAt: $document->updated_at->toISOString(),
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'markdownContent' => $this->markdownContent,
            'yjsStateBase64' => $this->yjsStateBase64,
            'updatedAt' => $this->updatedAt,
        ];
    }
}
