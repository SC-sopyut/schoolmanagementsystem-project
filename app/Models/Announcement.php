<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Announcement extends Model
{
    use HasFactory;

    public const AUDIENCE_ORGANIZATION = 'organization';

    public const AUDIENCE_ALL_STUDENTS = 'all_students';

    public const AUDIENCE_ALL_OFFICERS = 'all_officers';

    public const AUDIENCE_EVERYONE = 'everyone';

    protected $fillable = ['organization_id', 'officer_id', 'title', 'body', 'audience', 'published_at'];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(Officer::class, 'officer_id');
    }

    public function reads(): HasMany
    {
        return $this->hasMany(AnnouncementRead::class);
    }

    /** Has the given user already acknowledged this announcement? */
    public function isReadBy(User $user): bool
    {
        return $this->reads()->where('user_id', $user->id)->exists();
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        $organizationIds = $user->organizations()->pluck('organizations.id');
        $officerProfile = $user->officerProfile;
        $isOfficer = $officerProfile !== null;

        if ($officerProfile && ! $organizationIds->contains($officerProfile->organization_id)) {
            $organizationIds->push($officerProfile->organization_id);
        }

        return $query->where(function (Builder $query) use ($organizationIds, $isOfficer) {
            $query->where('audience', self::AUDIENCE_EVERYONE);

            if ($isOfficer) {
                $query->orWhere('audience', self::AUDIENCE_ALL_OFFICERS);
            } else {
                $query->orWhere('audience', self::AUDIENCE_ALL_STUDENTS);
            }

            if ($organizationIds->isNotEmpty()) {
                $query->orWhere(fn (Builder $organizationQuery) => $organizationQuery
                    ->where('audience', self::AUDIENCE_ORGANIZATION)
                    ->whereIn('organization_id', $organizationIds));
            }
        });
    }
}
