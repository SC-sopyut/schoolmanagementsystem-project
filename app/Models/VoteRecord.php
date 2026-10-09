<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VoteRecord extends Model
{
    protected $fillable = ['election_id', 'user_id', 'position'];
}
