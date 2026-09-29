<?php

namespace App\Policies;

use App\Models\Committee;
use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Officers may manage a committee's board only if they hold an officer position
     * in that committee's organization. The Student Council itself is treated as the
     * organization that owns council-wide committees, so council officers can also
     * assign cross-org tasks (per the "council can assign tasks to every organization"
     * requirement) via a dedicated council-scoped committee rather than bypassing this check.
     */
    public function manageBoard(User $user, Committee $committee): bool
    {
        $officer = $user->officerProfile;

        return $officer !== null && $officer->organization_id === $committee->organization_id;
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
