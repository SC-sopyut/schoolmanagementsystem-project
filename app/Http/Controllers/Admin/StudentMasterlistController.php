<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentMasterlist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentMasterlistController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/student-masterlist/index', [
            'studentIds' => StudentMasterlist::query()->latest()->get(['id', 'student_id_no', 'created_at']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'student_id_no' => ['required', 'regex:/^\d{4}-\d{2}-\d{5}$/', 'unique:student_masterlist,student_id_no'],
        ]);

        StudentMasterlist::create($data);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'School ID added to the masterlist.']);

        return back();
    }

    public function destroy(StudentMasterlist $studentMasterlist): RedirectResponse
    {
        $studentMasterlist->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'School ID removed from the masterlist.']);

        return back();
    }
}
