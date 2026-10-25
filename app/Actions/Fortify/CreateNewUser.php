<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $nameRule = 'regex:/^[\\p{L}][\\p{L}\\s.\'-]*$/u';

        Validator::make($input, [
            'email' => $this->emailRules(),
            'student_id_no' => ['required', 'regex:/^\\d{4}-\\d{2}-\\d{5}$/', 'exists:student_masterlist,student_id_no', 'unique:student_profiles,student_id_no'],
            'first_name' => ['required', 'string', 'max:100', $nameRule],
            'middle_name' => ['nullable', 'string', 'max:100', $nameRule],
            'last_name' => ['required', 'string', 'max:100', $nameRule],
            'suffix' => ['nullable', 'string', 'max:20', $nameRule],
            'course' => ['required', 'string', 'in:'.implode(',', StudentProfile::COURSES)],
            'year_level' => ['required', 'integer', 'between:1,4'],
            'password' => $this->passwordRules(),
        ], [
            'student_id_no.exists' => 'This School ID is not in the approved student masterlist. Ask an administrator to add it first.',
            'first_name.regex' => 'First name cannot contain numbers.',
            'middle_name.regex' => 'Middle name cannot contain numbers.',
            'last_name.regex' => 'Last name cannot contain numbers.',
            'suffix.regex' => 'Suffix cannot contain numbers.',
        ])->validate();

        return DB::transaction(function () use ($input): User {
            $name = implode(' ', array_filter([$input['first_name'], $input['middle_name'] ?? null, $input['last_name'], $input['suffix'] ?? null]));
            $user = User::create(['name' => $name, 'email' => $input['email'], 'password' => $input['password']]);
            $user->studentProfile()->create([
                'student_id_no' => $input['student_id_no'], 'first_name' => $input['first_name'],
                'middle_name' => $input['middle_name'] ?? null, 'last_name' => $input['last_name'],
                'suffix' => $input['suffix'] ?? null, 'course' => $input['course'], 'year_level' => $input['year_level'],
            ]);

            return $user;
        });
    }
}
