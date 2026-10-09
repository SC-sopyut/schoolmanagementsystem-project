<?php

namespace App\Http\Requests\Officer;

use App\Models\Committee;
use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageBoard', $this->route('committee')) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'assigned_to' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'parent_task_id' => ['nullable', 'integer', Rule::exists('tasks', 'id')],
            'status' => ['sometimes', Rule::in(Task::STATUSES)],
            'priority' => ['sometimes', Rule::in(Task::PRIORITIES)],
            'due_date' => ['nullable', 'date', 'after_or_equal:today'],
        ];
    }

    /** @return list<callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $assigneeId = $this->integer('assigned_to');
            $committee = $this->route('committee');
            if (! $committee instanceof Committee) {
                return;
            }
            $organizationId = $committee->organization_id;
            $parentTaskId = $this->integer('parent_task_id');
            if ($parentTaskId) {
                $parent = Task::query()->with('committee.organization')->find($parentTaskId);
                $officer = $this->user()?->officerProfile;
                if (! $parent || ! $parent->committee?->organization?->is_council || ! $officer || ! $officer->isTaskManager() || $officer->hasCouncilWideTaskAuthority() || $parent->assigned_to !== $this->user()->id || $parent->committee?->organization_id == $organizationId) {
                    $validator->errors()->add('parent_task_id', 'Choose an SSC task assigned to you for a different organization.');
                }
            }
            if (! $assigneeId) {
                return;
            }

            $isOfficer = DB::table('officers')->where('organization_id', $organizationId)->where('user_id', $assigneeId)->exists()
                || DB::table('organization_user')->join('officers', 'officers.user_id', '=', 'organization_user.user_id')
                    ->where('organization_user.organization_id', $organizationId)
                    ->where('organization_user.user_id', $assigneeId)->exists();

            if (! $isOfficer) {
                $validator->errors()->add('assigned_to', 'Choose a co-officer who belongs to this organization.');
            }
        }];
    }
}
