<?php

namespace App\Http\Requests\Officer;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Board-level authorization (does this officer own this committee?) is
        // done in the controller via TaskPolicy::manageBoard against the route's
        // {committee} binding.
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            // assignee must be a student who actually belongs to the committee's org -
            // enforced with a where() closure so officers can't assign tasks to
            // students outside their organization.
            'assigned_to' => [
                'nullable',
                'integer',
                Rule::exists('organization_user', 'user_id')->where(
                    fn ($query) => $query->where('organization_id', $this->route('committee')->organization_id)
                ),
            ],
            'status' => ['sometimes', Rule::in(Task::STATUSES)],
            'due_date' => ['nullable', 'date', 'after_or_equal:today'],
        ];
    }
}
