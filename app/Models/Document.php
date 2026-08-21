<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\DocumentSlug;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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

    protected $hidden = [
        'checkout_claim_hash',
        'owner_password_hash',
        'owner_recovery_key_hash',
        'owner_session_id',
        'visitor_password_hash',
    ];

    public static function prefixOwner(string $slug): ?self
    {
        return self::query()
            ->where('slug', DocumentSlug::root($slug))
            ->where('paid_until', '>', now())
            ->first();
    }

    public function announceRulesChanged(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::select('SELECT pg_notify(?, ?)', ['dumphere_mode', DocumentSlug::root($this->slug)]);
        }
    }

    public function announceDeleted(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::select('SELECT pg_notify(?, ?)', ['dumphere_deleted', $this->slug]);
        }
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected function casts(): array
    {
        return [
            'last_accessed_at' => 'datetime',
            'paid_until' => 'datetime',
            'checkout_reserved_until' => 'datetime',
            'readonly' => 'boolean',
        ];
    }
}
