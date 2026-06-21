<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lesson;

class LessonController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'student') {
            $classIds = $user->classes()->pluck('classes.id');
            $lessons = Lesson::whereIn('classe_id', $classIds)->with(['teacher', 'matiere'])->get();
        } elseif ($user->role === 'teacher') {
            $lessons = Lesson::where('professeur_id', $user->id)->with(['class_room', 'matiere'])->get();
        } else {
            $lessons = Lesson::with(['class_room', 'teacher', 'matiere'])->get();
        }

        $lessons->map(function ($lesson) {
            if ($lesson->type_contenu !== 'youtube' && $lesson->chemin_fichier) {
                $lesson->file_url = asset('storage/' . $lesson->chemin_fichier);
            } elseif ($lesson->type_contenu === 'youtube') {
                $lesson->file_url = $lesson->chemin_fichier;
            }
            return $lesson;
        });

        return response()->json($lessons);
    }

    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string',
            'description' => 'required|string',
            'classe_id' => 'required|exists:classes,id',
            'matiere_id' => 'required|exists:matieres,id',
            'type_contenu' => 'required|in:pdf,video,youtube',
            'file' => 'nullable|file|mimes:pdf,mp4,mov,avi|max:50000',
            'lien' => 'nullable|string'
        ]);

        $filePath = null;
        if ($request->type_contenu === 'youtube') {
            $filePath = $request->lien;
        } elseif ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('lessons', 'public');
        }

        $lesson = Lesson::create([
            'titre' => $request->titre,
            'description' => $request->description,
            'classe_id' => $request->classe_id,
            'matiere_id' => $request->matiere_id,
            'professeur_id' => $request->user()->id,
            'type_contenu' => $request->type_contenu,
            'chemin_fichier' => $filePath
        ]);

        if ($lesson->type_contenu !== 'youtube' && $lesson->chemin_fichier) {
            $lesson->file_url = asset('storage/' . $lesson->chemin_fichier);
        } elseif ($lesson->type_contenu === 'youtube') {
            $lesson->file_url = $lesson->chemin_fichier;
        }

        return response()->json(['message' => 'Cours ajouté avec succès', 'lesson' => $lesson->load(['matiere', 'class_room'])], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'titre' => 'required|string',
            'description' => 'required|string',
            'classe_id' => 'required|exists:classes,id',
            'matiere_id' => 'required|exists:matieres,id',
        ]);

        $lesson = Lesson::findOrFail($id);
        if ($lesson->professeur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $lesson->update([
            'titre' => $request->titre,
            'description' => $request->description,
            'classe_id' => $request->classe_id,
            'matiere_id' => $request->matiere_id,
        ]);

        return response()->json(['message' => 'Cours modifié avec succès', 'lesson' => $lesson->load(['matiere', 'class_room'])]);
    }

    public function destroy(Request $request, $id)
    {
        $lesson = Lesson::findOrFail($id);
        if ($lesson->professeur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $lesson->delete();

        return response()->json(['message' => 'Cours supprimé avec succès']);
    }
}
