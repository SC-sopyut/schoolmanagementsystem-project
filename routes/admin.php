<?php

/**
 * Register this as its own routes/admin.php, loaded in bootstrap/app.php
 * alongside web.php:
 *
 *   ->withRouting(
 *       web: __DIR__.'/../routes/web.php',
 *       ...
 *       then: function () {
 *           Route::middleware('web')
 *               ->prefix('admin')
 *               ->name('admin.')
 *               ->group(base_path('routes/admin.php'));
 *       },
 *   )
 *
 * Note the guest routes (login, 2FA challenge) are OUTSIDE the auth:admin
 * group for obvious reasons, but still inside the 'admin.' name prefix and
 * still never touch the default 'web' guard.
 */

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AuditController;
use App\Http\Controllers\Admin\ConcernController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrganizationMembershipController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest:admin')->group(function () {
    Route::get('login', [AdminAuthController::class, 'showLogin'])->name('login');
    Route::post('login', [AdminAuthController::class, 'login']);
    Route::get('two-factor-challenge', [AdminAuthController::class, 'showTwoFactorChallenge'])->name('two-factor.challenge');
    Route::post('two-factor-challenge', [AdminAuthController::class, 'confirmTwoFactorChallenge'])->name('two-factor.confirm');
});

Route::middleware(['auth:admin', 'is_admin'])->group(function () {
    Route::post('logout', [AdminAuthController::class, 'logout'])->name('logout');

    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('memberships', [OrganizationMembershipController::class, 'index'])->name('memberships.index');
    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::patch('users/{user}/password', [UserController::class, 'resetPassword'])->name('users.password');
    Route::post('memberships', [OrganizationMembershipController::class, 'store'])->name('memberships.store');
    Route::delete('memberships/{user}/{organization}', [OrganizationMembershipController::class, 'destroy'])->name('memberships.destroy');
    Route::delete('officer-affiliations/{user}/{organization}', [OrganizationMembershipController::class, 'destroyOfficerAffiliation'])->name('officer-affiliations.destroy');
    Route::get('audit', [AuditController::class, 'index'])->name('audit.index');

    Route::get('concerns', [ConcernController::class, 'index'])->name('concerns.index');
    Route::get('concerns/{concern}', [ConcernController::class, 'show'])->name('concerns.show');
});
