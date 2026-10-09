<?php

namespace App\Http\Requests\Officer;

use Illuminate\Foundation\Http\FormRequest;

class StoreBudgetItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // EventPolicy::managePlanning checked in controller against the {event}
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:150'],
            'estimated_cost' => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'actual_cost' => ['nullable', 'numeric', 'min:0', 'max:9999999.99'],
        ];
    }
}
