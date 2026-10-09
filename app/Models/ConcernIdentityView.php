<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConcernIdentityView extends Model
{
    public $timestamps = false;

    protected $fillable = ['admin_id', 'concern_id', 'viewed_at'];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    /** @return BelongsTo<Admin, $this> */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class);
    }

    /** @return BelongsTo<Concern, $this> */
    public function concern(): BelongsTo
    {
        return $this->belongsTo(Concern::class);
    }
}
