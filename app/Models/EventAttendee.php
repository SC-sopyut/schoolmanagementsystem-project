<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventAttendee extends Model
{
    /** @use HasFactory<Factory<static>> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = ['event_id', 'user_id', 'joined_at', 'checked_in_at', 'checked_in_by'];

    protected $casts = [
        'joined_at' => 'datetime',
        'checked_in_at' => 'datetime',
    ];

    /** @return BelongsTo<Event, $this> */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<User, $this> */
    public function checkedInBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }

    /** @return HasMany<EventAttendanceSession, $this> */
    public function attendanceSessions(): HasMany
    {
        return $this->hasMany(EventAttendanceSession::class);
    }
}
