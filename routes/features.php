<?php

/**
 * FULL replacement for routes/features.php from the first package (v3). Merge into routes/web.php
 * inside your existing ['auth', 'verified'] group. Also point the starter kit's `dashboard` route at
 * DashboardRedirectController so post-login lands on the right dashboard:
 *
 *   Route::get('dashboard', DashboardRedirectController::class)->name('dashboard');
 *
 * All routes sit in the `web` group, so CSRF (XSRF-TOKEN cookie + Inertia) applies automatically.
 */

use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\Officer;
use App\Http\Controllers\Officer\BudgetController;
use App\Http\Controllers\Officer\MembersController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Student;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('search', SearchController::class)->name('search');

    // The document repository is for officers; students receive announcements instead.
    Route::middleware('is_officer')->group(function () {
        Route::get('documents', [DocumentController::class, 'index'])->name('documents.index');
        Route::post('documents/folders/{folder}', [DocumentController::class, 'store'])->name('documents.store');
        Route::get('documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
        Route::get('documents/{document}/preview', [DocumentController::class, 'preview'])->name('documents.preview');
        Route::patch('documents/{document}/access', [DocumentController::class, 'updateAccess'])->name('documents.access');
        Route::delete('documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');
    });

    // ---------------- Students (any authenticated user) ----------------
    Route::prefix('student')->name('student.')->group(function () {
        Route::get('dashboard', Student\DashboardController::class)->name('dashboard');

        Route::get('elections', [Student\ElectionController::class, 'index'])->name('elections.index');
        Route::get('elections/{election}', [Student\ElectionController::class, 'show'])->name('elections.show');
        Route::post('elections/{election}/vote', [Student\ElectionController::class, 'store'])->name('elections.vote');

        Route::get('announcements', [Student\AnnouncementController::class, 'index'])->name('announcements.index');
        Route::post('announcements/{announcement}/read', [Student\AnnouncementController::class, 'markRead'])->name('announcements.read');

        Route::get('concerns', [Student\ConcernController::class, 'index'])->name('concerns.index');
        Route::get('concerns/create', [Student\ConcernController::class, 'create'])->name('concerns.create');
        Route::post('concerns', [Student\ConcernController::class, 'store'])->name('concerns.store');

        Route::get('events', [Student\EventController::class, 'index'])->name('events.index');
        Route::post('events/{event}/join', [Student\EventController::class, 'join'])->name('events.join');
    });

    // ---------------- Officers (requires an `officers` row) ----------------
    Route::middleware('is_officer')->prefix('officer')->name('officer.')->group(function () {
        Route::get('dashboard', Officer\DashboardController::class)->name('dashboard');
        Route::get('budget', BudgetController::class)->name('budget.index');
        Route::post('budget', [BudgetController::class, 'store'])->name('budget.store');
        Route::get('members', [MembersController::class, 'index'])->name('members.index');
        Route::post('members', [MembersController::class, 'store'])->name('members.store');
        Route::get('announcements', [Officer\AnnouncementController::class, 'index'])->name('announcements.index');
        Route::post('announcements', [Officer\AnnouncementController::class, 'store'])->name('announcements.store');

        Route::get('board', [Officer\TaskBoardController::class, 'overview'])->name('board');
        Route::post('committees/{committee}/tasks', [Officer\TaskBoardController::class, 'store'])->name('tasks.store');
        Route::patch('tasks/{task}/status', [Officer\TaskBoardController::class, 'updateStatus'])->name('tasks.status');

        Route::get('events', [Officer\EventPlanningController::class, 'index'])->name('events.index');
        Route::post('events', [Officer\EventPlanningController::class, 'store'])->name('events.store');
        Route::post('events/{event}/budget-items', [Officer\EventPlanningController::class, 'storeBudgetItem'])->name('events.budget-items.store');
        Route::patch('events/{event}/checklist-items/{checklistItem}/toggle', [Officer\EventPlanningController::class, 'toggleChecklistItem'])->name('events.checklist-items.toggle');

        Route::get('concerns', [Officer\ConcernReviewController::class, 'index'])->name('concerns.index');
        Route::patch('concerns/{concern}/review', [Officer\ConcernReviewController::class, 'review'])->name('concerns.review');
        Route::patch('concerns/{concern}/forward', [Officer\ConcernReviewController::class, 'forward'])->name('concerns.forward');
        Route::patch('concerns/{concern}/resolve', [Officer\ConcernReviewController::class, 'resolve'])->name('concerns.resolve');
        Route::post('concerns/{concern}/updates', [Officer\ConcernReviewController::class, 'addUpdate'])->name('concerns.updates.store');

        Route::get('activity-logs', [Officer\ActivityLogController::class, 'index'])->name('activity-logs.index');
        Route::post('activity-logs', [Officer\ActivityLogController::class, 'store'])->name('activity-logs.store');
    });
});
