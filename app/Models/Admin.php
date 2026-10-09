<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property string $name
 * @property string $email
 *
 * Deliberately does NOT extend App\Models\User and is never rows in the `users`
 * table. This is a fully separate identity: separate table, separate guard
 * ('admin', see config/auth.php), separate login route, no self-service password
 * reset, 2FA required. Students and officers can never authenticate as an Admin
 * no matter what role/officer flags they hold.
 */
class Admin extends Authenticatable
{
    /** @use HasFactory<Factory<static>> */
    use HasFactory;

    use Notifiable;
    use TwoFactorAuthenticatable;

    protected $fillable = ['name', 'email', 'password'];

    protected $hidden = ['password', 'remember_token', 'two_factor_recovery_codes', 'two_factor_secret'];

    /** @return HasMany<ConcernIdentityView, $this> */
    public function identityViews(): HasMany
    {
        return $this->hasMany(ConcernIdentityView::class);
    }
}
