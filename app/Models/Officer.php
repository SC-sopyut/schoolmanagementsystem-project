<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Collection;

class Officer extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'organization_id', 'position'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function visibleOrganizationIds(): Collection
    {
        if ($this->organization?->is_council) {
            return Organization::query()->pluck('id');
        }

        return collect([$this->organization_id]);
    }

    public function dashboardLabel(): string
    {
        return trim(($this->organization?->name ?? '').' '.($this->position ?? 'Officer'));
    }
}
