<?php

use App\Models\StudentMasterlist;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    StudentMasterlist::create(['student_id_no' => '2024-01-00001']);

    $response = $this->post(route('register.store'), [
        'student_id_no' => '2024-01-00001',
        'first_name' => 'Test',
        'middle_name' => null,
        'last_name' => 'User',
        'suffix' => null,
        'course' => 'Bachelor of Science in Information Technology',
        'year_level' => 1,
        'email' => 'test@acc.edu.ph',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertDatabaseHas('student_profiles', [
        'student_id_no' => '2024-01-00001',
        'first_name' => 'Test',
        'last_name' => 'User',
        'status' => 'pending',
    ]);
});

test('registration requires a school ID from the masterlist', function () {
    $response = $this->from(route('register'))->post(route('register.store'), [
        'student_id_no' => '2024-01-99999',
        'first_name' => 'Test', 'last_name' => 'User',
        'course' => 'Bachelor of Science in Information Technology', 'year_level' => 1,
        'email' => 'test@acc.edu.ph', 'password' => 'password', 'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('register'));
    $response->assertSessionHasErrors('student_id_no');
    $this->assertGuest();
});

test('registration does not accept numbers in name fields', function () {
    StudentMasterlist::create(['student_id_no' => '2024-01-00002']);

    $response = $this->from(route('register'))->post(route('register.store'), [
        'student_id_no' => '2024-01-00002',
        'first_name' => 'Test2',
        'middle_name' => 'Middle3',
        'last_name' => 'User4',
        'suffix' => 'Jr5',
        'course' => 'Bachelor of Science in Information Technology',
        'year_level' => 1,
        'email' => 'name-check@acc.edu.ph',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('register'));
    $response->assertSessionHasErrors(['first_name', 'middle_name', 'last_name', 'suffix']);
    $this->assertGuest();
});
