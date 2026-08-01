<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasUuids;

    public const MAX_SIZE_BYTES = 512_000;

    protected $fillable = [
        'slug',
        'title',
        'content_html',
        'yjs_state_base64',
        'last_accessed_at',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected function casts(): array
    {
        return [
            'last_accessed_at' => 'datetime',
        ];
    }
}
