<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$teachers = App\Models\User::where('role', 'teacher')->with('classes')->get();
foreach($teachers as $t) {
    echo 'Teacher ' . $t->name . " classes: " . count($t->classes) . "\n";
}
