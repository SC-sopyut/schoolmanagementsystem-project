<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedItem extends Model
{
    public $timestamps = false;

    protected $fillable = ['organization_id', 'user_id', 'message', 'created_at'];

    protected $casts = ['created_at' => 'datetime'];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** One-liner used by controllers: FeedItem::record($user, $orgId, 'uploaded "x.xlsx"'). */
    public static function record(?User $actor, ?int $organizationId, string $message): self
    {
        return static::create([
            'user_id' => $actor?->id,
            'organization_id' => $organizationId,
            'message' => $message,
            'created_at' => now(),
        ]);
    }
}
