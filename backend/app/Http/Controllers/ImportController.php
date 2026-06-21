<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class ImportController extends Controller
{
    public function importStudents(Request $request)
    {
        try {
            $request->validate([
                'class_id' => 'required|exists:classes,id',
                'students' => 'required|array',
                'students.*.nom' => 'nullable|string',
                'students.*.prenom' => 'nullable|string',
                'students.*.code_massar' => 'required|string',
            ]);

            $classId = $request->class_id;
            $studentsData = $request->students;
            $importedStudents = [];

            DB::beginTransaction();

            foreach ($studentsData as $data) {
                // Ignore if Code Massar is missing
                if (empty($data['code_massar'])) continue;

                $plainPassword = Str::random(10);
                $name = trim(($data['prenom'] ?? '') . ' ' . ($data['nom'] ?? '')) ?: 'Inconnu';

                $user = User::create([
                    'name' => $name,
                    'identifier' => $data['code_massar'],
                    'role' => 'student',
                    'password' => Hash::make($plainPassword),
                    'plain_password' => $plainPassword,
                ]);

                // Attach to class
                $user->classes()->attach($classId);

                $importedStudents[] = clone $user;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => count($importedStudents) . ' étudiants importés avec succès.',
                'students' => $importedStudents
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur Import Excel: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'importation: ' . $e->getMessage()
            ], 500);
        }
    }
}
