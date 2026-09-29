<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventAttendee extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = ['event_id', 'user_id', 'joined_at'];

    protected $casts = [
        'joined_at' => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
