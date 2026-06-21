<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\SubjectController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return clone $request->user()->load(['classes', 'subjects']);
    });

    // Admin Routes
    Route::post('/admin/import-students', [ImportController::class, 'importStudents']);
    Route::get('/admin/data', [AdminController::class, 'getData']);
    Route::post('/admin/teachers', [AdminController::class, 'storeTeacher']);
    Route::put('/admin/users/{user}', [AdminController::class, 'updateUser']);
    Route::delete('/admin/users/{user}', [AdminController::class, 'destroyUser']);

    // Lessons Routes
    Route::get('/lessons', [LessonController::class, 'index']);
    Route::post('/lessons', [LessonController::class, 'store']);
    Route::put('/lessons/{id}', [LessonController::class, 'update']);
    Route::delete('/lessons/{id}', [LessonController::class, 'destroy']);

    // Subjects Routes
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::post('/subjects', [SubjectController::class, 'store']);
    Route::put('/subjects/{id}', [SubjectController::class, 'update']);
    Route::delete('/subjects/{id}', [SubjectController::class, 'destroy']);

    // Quizzes Routes
    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::put('/quizzes/{id}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);
    Route::post('/quizzes/{id}/submit', [QuizController::class, 'submit']);
    Route::get('/quizzes/{id}/submissions', [QuizController::class, 'getSubmissions']);
    Route::post('/quizzes/{id}/submissions/{student_id}/grade', [QuizController::class, 'gradeSubmission']);
});
