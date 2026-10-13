<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentMasterlist extends Model
{
    protected $table = 'student_masterlist';

    protected $fillable = ['student_id_no'];
}
