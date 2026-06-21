<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '.*');

Route::get('/setup-db', function() {
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true, '--seed' => true]);
        return "Database migrated and seeded successfully!";
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage() . " on line " . $e->getLine() . " in " . $e->getFile();
    }
});
