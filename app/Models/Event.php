<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id', 'title', 'description', 'location',
        'starts_at', 'ends_at', 'status', 'created_by',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Officer::class, 'created_by');
    }

    public function attendees(): HasMany
    {
        return $this->hasMany(EventAttendee::class);
    }

    public function budgetItems(): HasMany
    {
        return $this->hasMany(EventBudgetItem::class);
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(EventChecklistItem::class);
    }

    public function isCouncilWide(): bool
    {
        return is_null($this->organization_id);
    }

    /** Total estimated budget, used by the officer planning UI. */
    public function totalEstimatedCost(): float
    {
        return (float) $this->budgetItems()->sum('estimated_cost');
    }
}
