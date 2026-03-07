<?php

declare(strict_types=1);

namespace App\Domain\Document\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DocumentUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $slug,
        public readonly string $markdownContent,
        public readonly string $updatedAt,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("document.{$this->slug}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'document.updated';
    }
}
