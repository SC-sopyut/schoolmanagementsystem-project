# Patch: app/Models/Officer.php

I don't have your existing Officer.php (it predates this feature set), so rather
than guess its other columns/relations and overwrite something, add these two
methods to the class you already have. Both only depend on `organization_id`
and the `organization()` relation, which you already told me exist.

```php
use Illuminate\Support\Collection;

/**
 * Organization ids this officer can see data for. A normal officer (including
 * a sub-org President, e.g. "BYTE President") only sees their own org. An
 * officer whose organization is flagged is_council (the SSC President) sees
 * every organization — this single flag is the entire council-wide/sub-org
 * distinction; nothing else branches on "is this a President".
 */
public function visibleOrganizationIds(): Collection
{
    if ($this->organization?->is_council) {
        return \App\Models\Organization::query()->pluck('id');
    }

    return collect([$this->organization_id]);
}

/**
 * Dashboard label per the Figma: "{organization name} {position}", e.g.
 * "BYTE President" or "SSC President". Falls back gracefully if position
 * hasn't been set for an older officer row.
 */
public function dashboardLabel(): string
{
    return trim(($this->organization?->name ?? '') . ' ' . ($this->position ?? 'Officer'));
}
```

Nothing else in this patch set assumes any other shape of Officer.php beyond
`organization_id`, `organization()`, and now `position` (added by migration
`2026_01_15_000001_add_position_and_council_flag.php`).
