<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$req = new \Illuminate\Http\Request();
$req->merge(['identifier' => 'ADMIN2024', 'password' => 'Admin@Secure2026!']);
try {
    $res = app(\App\Http\Controllers\AuthController::class)->login($req);
    print_r($res->getData());
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
