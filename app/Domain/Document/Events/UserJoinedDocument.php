<?php

declare(strict_types=1);

namespace App\Domain\Document\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserJoinedDocument implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $slug,
        public readonly string $sessionId,
        public readonly string $color,
        public readonly ?string $name,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel("document.{$this->slug}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'user.joined';
    }

    public function broadcastWith(): array
    {
        return [
            'sessionId' => $this->sessionId,
            'color' => $this->color,
            'name' => $this->name,
        ];
    }
}
