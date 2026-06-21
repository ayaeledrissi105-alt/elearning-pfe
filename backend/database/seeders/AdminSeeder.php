<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['identifier' => 'ADMIN2024'], // the Admin code
            [
                'name' => 'Mohamed', // Requested by user
                'email' => 'admin@admin.com',
                'password' => Hash::make('Admin@Secure2026!'),
                'role' => 'admin',
            ]
        );
    }
}
