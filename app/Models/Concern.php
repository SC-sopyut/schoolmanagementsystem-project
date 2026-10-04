<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Concern extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'organization_id', 'subject', 'body', 'category', 'priority',
        'is_anonymous', 'status', 'reviewed_by', 'officer_notes', 'forwarded_at', 'resolved_at',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'forwarded_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public const STATUSES = ['submitted', 'reviewed', 'forwarded', 'resolved'];

    public const PRIORITIES = ['low', 'medium', 'high'];

    protected static function booted(): void
    {
        static::creating(function (Concern $concern) {
            $concern->tracking_code ??= 'CON-'.now()->format('Y').'-'.str_pad(
                (string) (static::whereYear('created_at', now()->year)->count() + 1),
                4,
                '0',
                STR_PAD_LEFT
            );
        });

        // The system-generated first timeline entry, matching the "Concern Received"
        // stage shown on the student's tracker as soon as they submit.
        static::created(function (Concern $concern) {
            $concern->updatesTimeline()->create(['stage_label' => 'Concern Received']);
        });
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Officer::class, 'reviewed_by');
    }

    public function updatesTimeline(): HasMany
    {
        return $this->hasMany(ConcernUpdate::class)->orderBy('created_at');
    }

    /**
     * The single source of truth for identity redaction. Every officer-facing
     * controller/response MUST build its payload through this method rather than
     * serializing the model (or its `student` relation) directly — that's the one
     * place "is this concern anonymous" gets checked before a name ever leaves
     * the server. Admin\ConcernController is the only caller allowed to skip this
     * and read `student` directly, and it must log that read (see StoreLog note
     * in Admin\ConcernController).
     */
    public function toOfficerArray(): array
    {
        return [
            'id' => $this->id,
            'tracking_code' => $this->tracking_code,
            'subject' => $this->subject,
            'body' => $this->body,
            'category' => $this->category,
            'priority' => $this->priority,
            'status' => $this->status,
            'is_anonymous' => $this->is_anonymous,
            'submitted_by' => $this->is_anonymous
                ? 'Anonymous student'
                : $this->student?->name,
            'organization' => $this->organization?->only('id', 'name'),
            'timeline' => $this->updatesTimeline->map->only('stage_label', 'message', 'created_at'),
            'created_at' => $this->created_at,
        ];
    }
}
