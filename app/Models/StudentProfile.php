<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentProfile extends Model
{
    public const HOME_ORGANIZATIONS = [
        'Bachelor of Science in Criminology' => 'CRIM',
        'Bachelor of Science in Information Technology' => 'BYTE',
        'Bachelor of Science in Hospitality Management' => 'COHME',
        'Bachelor of Elementary Education' => 'LOTES',
        'Bachelor of Secondary Education' => 'LOTES',
    ];

    public const COURSES = [
        'Bachelor of Science in Criminology',
        'Bachelor of Science in Information Technology',
        'Bachelor of Science in Hospitality Management',
        'Bachelor of Elementary Education',
        'Bachelor of Secondary Education',
    ];

    protected $fillable = [
        'student_id_no', 'first_name', 'middle_name', 'last_name', 'suffix',
        'course', 'year_level', 'status', 'verified_at', 'verified_by',
    ];

    protected function casts(): array
    {
        return ['year_level' => 'integer', 'verified_at' => 'datetime'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Admin, $this> */
    public function verifier(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'verified_by');
    }

    public function homeOrganizationName(): ?string
    {
        return self::HOME_ORGANIZATIONS[$this->course] ?? null;
    }
}
