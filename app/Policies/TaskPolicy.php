<?php

namespace App\Policies;

use App\Models\Committee;
use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Presidents and the internal/external vice presidents manage task assignments.
     * SSC leadership has authority across all organizations; other leaders stay in their own.
     */
    public function manageBoard(User $user, Committee $committee): bool
    {
        $officer = $user->officerProfile;

        return $officer !== null
            && $officer->isTaskManager()
            && ($officer->hasCouncilWideTaskAuthority() || $officer->organization_id === $committee->organization_id);
    }

    /** Only the assignee or a manager of the task's committee may move it across the board. */
    public function updateStatus(User $user, Task $task): bool
    {
        if ($task->assigned_to === $user->id) {
            return true;
        }

        return $this->manageBoard($user, $task->committee);
    }
}
