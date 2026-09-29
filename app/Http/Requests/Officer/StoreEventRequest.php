<?php

namespace App\Http\Requests\Officer;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // EventPolicy::plan checked in controller
    }

    public function rules(): array
    {
        return [
            // null/omitted organization_id = council-wide event; EventPolicy::plan
            // decides in the controller whether THIS officer may create one.
            'organization_id' => ['nullable', 'integer', 'exists:organizations,id'],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'location' => ['nullable', 'string', 'max:150'],
            'starts_at' => ['required', 'date', 'after_or_equal:today'],
            'ends_at' => ['required', 'date', 'after:starts_at'],
            'budget_items' => ['sometimes', 'array'],
            'budget_items.*.label' => ['required_with:budget_items', 'string', 'max:150'],
            'budget_items.*.estimated_cost' => ['required_with:budget_items', 'numeric', 'min:0'],
            'checklist_items' => ['sometimes', 'array'],
            'checklist_items.*.label' => ['required_with:checklist_items', 'string', 'max:150'],
        ];
    }
}
