<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConcernRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Organization membership is checked by ConcernPolicy in the controller.
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'organization_id' => ['required', 'integer', 'exists:organizations,id'],
            'subject' => ['required', 'string', 'max:150'],
            'category' => ['required', 'string', Rule::in(['Facilities', 'Academics', 'Services', 'Safety', 'Other'])],
            'priority' => ['required', 'string', Rule::in(['low', 'medium', 'high'])],
            'body' => ['required', 'string', 'max:5000'],
            'is_anonymous' => ['sometimes', 'boolean'],
        ];
    }
}
