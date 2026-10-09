<?php

namespace App\Http\Requests\Officer;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // TaskPolicy::updateStatus checked in controller against the Task instance
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            // Whitelisted against the model's own STATUSES constant, so a drag-and-drop
            // payload can never smuggle in an arbitrary string as the new column.
            'status' => ['required', Rule::in(Task::STATUSES)],
        ];
    }
}
