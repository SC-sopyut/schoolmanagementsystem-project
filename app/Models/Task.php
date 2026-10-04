<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    use HasFactory;

    protected $fillable = ['committee_id', 'title', 'description', 'assigned_to', 'status', 'priority', 'due_date', 'created_by'];

    protected $casts = ['due_date' => 'date'];

    // Figma board columns: Backlog | To Do | In Progress | Review | Done
    public const STATUSES = ['backlog', 'todo', 'in_progress', 'review', 'done'];

    public const PRIORITIES = ['low', 'medium', 'high'];

    public function committee(): BelongsTo
    {
        return $this->belongsTo(Committee::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Officer::class, 'created_by');
    }
}
