<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ClassRoom;
use App\Models\Subject;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function getData()
    {
        return response()->json([
            'classes' => ClassRoom::all(),
            'subjects' => Subject::all(),
            'students' => User::where('role', 'student')->with('classes')->get(),
            'teachers' => User::where('role', 'teacher')->with(['classes', 'subjects'])->get()
        ]);
    }

    public function storeTeacher(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'filieres' => 'required|array',
        ]);

        DB::beginTransaction();
        try {
            // Generate Code Prof (e.g. PROF-XXXX random numbers)
            $codeProf = 'PROF-' . rand(1000, 9999);
            
            // Generate Email
            $emailBase = strtolower(str_replace(' ', '.', trim($request->name)));
            $emailBase = preg_replace('/[^a-z0-9.]/', '', $emailBase);
            $email = $emailBase . '@gmail.com';

            $plainPassword = Str::random(10);

            $teacher = User::create([
                'name' => $request->name,
                'identifier' => $codeProf,
                'email' => $email,
                'password' => Hash::make($plainPassword),
                'plain_password' => $plainPassword,
                'role' => 'teacher'
            ]);

            // Process filieres to assign proper classes
            $filieres = $request->filieres ?? [];
            $classIdsToAssign = [];

            if (in_array('ALL', $filieres) || in_array('Toutes les filières', $filieres)) {
                $classIdsToAssign = ClassRoom::pluck('id')->toArray();
            } else {
                foreach ($filieres as $filiere) {
                    // Match classes starting with this filiere (e.g. DWFS -> DWFS-1, DWFS-2)
                    $matchedClasses = ClassRoom::where('nom', 'like', $filiere . '-%')->pluck('id')->toArray();
                    $classIdsToAssign = array_merge($classIdsToAssign, $matchedClasses);
                }
            } 
            
            $teacher->classes()->attach($classIdsToAssign);

            DB::commit();

            return response()->json([
                'message' => 'Professeur créé avec succès',
                'teacher' => clone $teacher->load(['classes'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur: ' . $e->getMessage()], 500);
        }
    }

    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            if ($user->role === 'student') {
                $user->update([
                    'name' => $request->name,
                    'identifier' => $request->identifier ?? $user->identifier,
                ]);

                if ($request->filled('password')) {
                    $user->update([
                        'password' => Hash::make($request->password),
                        'plain_password' => $request->password,
                    ]);
                }

                if ($request->filled('classe_id')) {
                    $user->classes()->sync([$request->classe_id]);
                }
            } elseif ($user->role === 'teacher') {
                $user->update([
                    'name' => $request->name,
                    'email' => $request->email ?? $user->email,
                ]);

                if ($request->filled('password')) {
                    $user->update([
                        'password' => Hash::make($request->password),
                        'plain_password' => $request->password,
                    ]);
                }

                if ($request->has('filieres')) {
                    $filieres = $request->filieres ?? [];
                    $classIdsToAssign = [];

                    if (in_array('ALL', $filieres) || in_array('Toutes les filières', $filieres)) {
                        $classIdsToAssign = ClassRoom::pluck('id')->toArray();
                    } else {
                        foreach ($filieres as $filiere) {
                            $matchedClasses = ClassRoom::where('nom', 'like', $filiere . '-%')->pluck('id')->toArray();
                            $classIdsToAssign = array_merge($classIdsToAssign, $matchedClasses);
                        }
                    } 
                    
                    $user->classes()->sync($classIdsToAssign);
                }
            }

            DB::commit();
            return response()->json([
                'message' => 'Utilisateur modifié avec succès',
                'user' => clone $user->load('classes')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur: ' . $e->getMessage()], 500);
        }
    }

    public function destroyUser(User $user)
    {
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Impossible de supprimer un administrateur.'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }
}
