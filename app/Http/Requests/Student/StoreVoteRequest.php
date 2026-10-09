<?php

namespace App\Http\Requests\Student;

use App\Models\Election;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreVoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // VotePolicy is checked in ElectionController.
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'candidate_id' => ['required', 'integer', 'exists:candidates,id'],
            'position' => ['required', 'string', 'max:100'],
        ];
    }

    /** @return list<callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            $election = $this->route('election');
            if (! $election instanceof Election) {
                return;
            }

            $candidateId = $this->integer('candidate_id');
            if ($candidateId > 0 && ! $election->candidates()
                ->whereKey($candidateId)
                ->where('position', $this->string('position')->toString())
                ->exists()) {
                $validator->errors()->add('candidate_id', 'Choose a candidate for this position in this election.');
            }
        }];
    }
}
