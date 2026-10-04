<?php

namespace App\Http\Requests\Officer;

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

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'assigned_to' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'status' => ['sometimes', Rule::in(Task::STATUSES)],
            'due_date' => ['nullable', 'date', 'after_or_equal:today'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $assigneeId = $this->integer('assigned_to');
            if (! $assigneeId) {
                return;
            }

            $organizationId = $this->route('committee')->organization_id;
            $isMember = DB::table('organization_user')->where('organization_id', $organizationId)->where('user_id', $assigneeId)->exists();
            $isOfficer = DB::table('officers')->where('organization_id', $organizationId)->where('user_id', $assigneeId)->exists();

            if (! $isMember && ! $isOfficer) {
                $validator->errors()->add('assigned_to', 'Choose a student or officer who belongs to this organization.');
            }
        }];
    }
}
