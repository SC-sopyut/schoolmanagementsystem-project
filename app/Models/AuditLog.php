<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/** @property array<string, mixed>|null $metadata */
class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = ['actor_type', 'actor_id', 'action', 'subject_type', 'subject_id', 'organization_id', 'metadata', 'ip_address', 'created_at'];

    protected function casts(): array
    {
        return ['metadata' => 'array', 'created_at' => 'datetime'];
    }

    /** @return MorphTo<Model, $this> */
    public function actor(): MorphTo
    {
        return $this->morphTo();
    }

    public function actorName(): ?string
    {
        $actor = $this->actor;

        return $actor instanceof Admin || $actor instanceof User ? $actor->name : null;
    }

    /** @return BelongsTo<Organization, $this> */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /** @param Builder<AuditLog> $query
     * @return Builder<AuditLog>
     */
    public function scopeRecent(Builder $query): Builder
    {
        return $query->orderByDesc('created_at');
    }
}
