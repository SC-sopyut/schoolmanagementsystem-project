<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    /** @use HasFactory<Factory<static>> */
    use HasFactory;

    protected $fillable = ['committee_id', 'parent_task_id', 'title', 'description', 'assigned_to', 'status', 'priority', 'due_date', 'created_by'];

    protected $casts = ['due_date' => 'date'];

    // Figma board columns: Backlog | To Do | In Progress | Review | Done
    public const STATUSES = ['backlog', 'todo', 'in_progress', 'review', 'done'];

    public const PRIORITIES = ['low', 'medium', 'high'];

    /** @return BelongsTo<Committee, $this> */
    public function committee(): BelongsTo
    {
        return $this->belongsTo(Committee::class);
    }

    /** @return BelongsTo<User, $this> */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /** @return BelongsTo<Officer, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Officer::class, 'created_by');
    }

    /** @return BelongsTo<Task, $this> */
    public function parentTask(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_task_id');
    }

    /** @return HasMany<Task, $this> */
    public function followUpTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'parent_task_id');
    }
}
