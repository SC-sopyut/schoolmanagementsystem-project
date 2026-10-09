<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string|null $location
 * @property int|null $organization_id
 * @property string $status
 * @property Carbon|null $starts_at
 * @property Carbon|null $ends_at
 * @property int $attendees_count
 * @property int $checklist_total
 * @property int $checklist_done
 * @property numeric-string|null $budget_allocated
 * @property numeric-string|null $budget_spent
 */
class Event extends Model
{
    /** @use HasFactory<Factory<static>> */
    use HasFactory;

    protected $fillable = [
        'organization_id', 'title', 'description', 'location',
        'starts_at', 'ends_at', 'status', 'created_by',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    /** @return BelongsTo<Organization, $this> */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /** @return BelongsTo<Officer, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Officer::class, 'created_by');
    }

    /** @return HasMany<EventAttendee, $this> */
    public function attendees(): HasMany
    {
        return $this->hasMany(EventAttendee::class);
    }

    /** @return HasMany<EventBudgetItem, $this> */
    public function budgetItems(): HasMany
    {
        return $this->hasMany(EventBudgetItem::class);
    }

    /** @return HasMany<EventChecklistItem, $this> */
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
