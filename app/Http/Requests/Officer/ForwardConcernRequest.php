<?php

namespace App\Http\Requests\Officer;

use Illuminate\Foundation\Http\FormRequest;

class ForwardConcernRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // ConcernPolicy::review / ::forward checked in controller
    }

    public function rules(): array
    {
        return [
            // Officer's notes are required before forwarding - this is what actually
            // gets sent to the board/office contact, per "the board is just an office
            // or email address" design decision, so it can't be blank.
            'officer_notes' => ['required', 'string', 'max:3000'],
        ];
    }
}
