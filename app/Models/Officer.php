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
        if ($this->hasCouncilWideTaskAuthority()) {
            return Organization::query()->pluck('id');
        }

        return collect([$this->organization_id]);
    }

    public function isTaskManager(): bool
    {
        $position = strtolower(preg_replace('/[^a-z0-9]+/', ' ', (string) $this->position) ?? '');
        $isPresident = str_contains($position, 'president')
            && ! str_contains($position, 'vice')
            && ! str_contains($position, 'assistant')
            && ! str_contains($position, 'deputy');
        $isVicePresident = (preg_match('/\b(vice president|vp)\b/', $position) === 1)
            && (str_contains($position, 'internal') || str_contains($position, 'external'));

        return $isPresident || $isVicePresident;
    }

    public function hasCouncilWideTaskAuthority(): bool
    {
        return $this->isTaskManager() && (bool) $this->organization?->is_council;
    }

    public function dashboardLabel(): string
    {
        return trim(($this->organization?->name ?? '').' '.($this->position ?? 'Officer'));
    }
}
