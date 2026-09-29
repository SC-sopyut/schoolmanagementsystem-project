<?php

namespace App\Http\Requests\Officer;

use App\Models\ActivityLog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreActivityLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Any authenticated officer may log an activity for their own organization;
        // the controller forces officer_id/organization_id from the session rather
        // than trusting client input (see StoreActivityLogRequest usage note).
        return $this->user()->officerProfile !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'category' => ['required', Rule::in(ActivityLog::CATEGORIES)],
            'activity_date' => ['required', 'date', 'before_or_equal:today'],
            'accreditation_ref' => ['nullable', 'string', 'max:100'],
        ];
    }
}
