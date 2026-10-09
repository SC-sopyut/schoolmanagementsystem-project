<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    /** @use HasFactory<Factory<static>> */
    use HasFactory;

    protected $fillable = [
        'officer_id', 'organization_id', 'title', 'description',
        'category', 'activity_date', 'accreditation_ref',
    ];

    protected $casts = [
        'activity_date' => 'date',
    ];

    public const CATEGORIES = ['meeting', 'event', 'training', 'community_service', 'other'];

    /** @return BelongsTo<Officer, $this> */
    public function officer(): BelongsTo
    {
        return $this->belongsTo(Officer::class);
    }

    /** @return BelongsTo<Organization, $this> */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
