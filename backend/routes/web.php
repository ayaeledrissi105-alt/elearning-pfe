<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/setup-db', function() {
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true]);
        return "Database migrated successfully!";
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage() . " on line " . $e->getLine() . " in " . $e->getFile();
    }
});
