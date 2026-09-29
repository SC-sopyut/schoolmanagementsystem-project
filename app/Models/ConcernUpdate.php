<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConcernUpdate extends Model
{
    public $timestamps = false;

    protected $fillable = ['concern_id', 'officer_id', 'stage_label', 'message', 'created_at'];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(fn (ConcernUpdate $update) => $update->created_at ??= now());
    }

    public function concern(): BelongsTo
    {
        return $this->belongsTo(Concern::class);
    }

    public function officer(): BelongsTo
    {
        return $this->belongsTo(Officer::class);
    }
}
