<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $organization_id
 * @property int $created_by
 * @property string $title
 * @property string $category
 * @property numeric-string $amount
 * @property Carbon $period_start
 * @property Carbon $period_end
 * @property string|null $notes
 */
class BudgetPlan extends Model
{
    /** @use HasFactory<Factory<static>> */
    use HasFactory;

    protected $fillable = [
        'organization_id', 'created_by', 'title', 'category', 'amount',
        'period_start', 'period_end', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'period_start' => 'date',
            'period_end' => 'date',
        ];
    }

    /** @return BelongsTo<Organization, $this> */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /** @return BelongsTo<Officer, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(Officer::class, 'created_by');
    }
}
