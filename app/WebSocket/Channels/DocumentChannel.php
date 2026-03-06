<?php

declare(strict_types=1);

namespace App\WebSocket\Channels;

use Illuminate\Support\Str;

class DocumentChannel
{
    public function join(string $slug): array|false
    {
        return [
            'id' => session()->getId() ?: Str::uuid()->toString(),
            'name' => 'Anonymous ' . Str::random(4),
            'color' => self::randomColor(),
        ];
    }

    private static function randomColor(): string
    {
        $colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
            '#BB8FCE', '#85C1E9', '#F1948A', '#82E0AA',
        ];

        return $colors[array_rand($colors)];
    }
}
