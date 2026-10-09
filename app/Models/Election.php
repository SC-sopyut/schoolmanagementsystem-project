<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Election extends Model
{
    /** @use HasFactory<Factory<static>> */
    use HasFactory;

    protected $fillable = ['organization_id', 'created_by', 'title', 'description', 'positions', 'starts_at', 'ends_at', 'status', 'results_published_at'];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'positions' => 'array',
        'results_published_at' => 'datetime',
    ];

    /** @return BelongsTo<Organization, $this> */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /** @return HasMany<Candidate, $this> */
    public function candidates(): HasMany
    {
        return $this->hasMany(Candidate::class);
    }

    /** @return HasMany<Vote, $this> */
    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    /** True while the election is inside its voting window AND marked open. */
    public function isOpenForVoting(): bool
    {
        return $this->status === 'open'
            && now()->between($this->starts_at, $this->ends_at);
    }

    /** Council-wide elections have no organization_id and are open to every student. */
    public function isCouncilWide(): bool
    {
        return is_null($this->organization_id);
    }
}
