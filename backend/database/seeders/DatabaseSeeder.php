<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

use App\Models\ClassRoom;
use App\Models\Subject;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
        ]);

        $classes = ['DWFS-1', 'DWFS-2', 'EII-1', 'EII-2', 'CG-1', 'CG-2', 'GMP-1', 'GMP-2'];
        foreach ($classes as $className) {
            ClassRoom::firstOrCreate(['nom' => $className]);
        }


    }
}
