<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subject;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'teacher') {
            return response()->json(Subject::where('professeur_id', $user->id)->get());
        } elseif ($user->role === 'student') {
            return response()->json(Subject::all()); 
        }
        return response()->json(Subject::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255'
        ]);

        $subject = Subject::create([
            'nom' => $request->nom,
            'professeur_id' => $request->user()->id
        ]);

        return response()->json(['message' => 'Matière ajoutée', 'subject' => $subject], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nom' => 'required|string|max:255'
        ]);

        $subject = Subject::where('id', $id)->where('professeur_id', $request->user()->id)->firstOrFail();
        $subject->update(['nom' => $request->nom]);

        return response()->json(['message' => 'Matière modifiée', 'subject' => $subject]);
    }

    public function destroy(Request $request, $id)
    {
        $subject = Subject::where('id', $id)->where('professeur_id', $request->user()->id)->firstOrFail();
        $subject->delete();

        return response()->json(['message' => 'Matière supprimée']);
    }
}
