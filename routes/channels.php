<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Str;

Broadcast::channel('document.{slug}', function ($user, string $slug) {
    return [
        'id' => session()->getId() ?: Str::uuid()->toString(),
        'name' => 'Anonymous ' . Str::random(4),
    ];
});
