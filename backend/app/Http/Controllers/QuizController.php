<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quiz;
use App\Models\Question;
use App\Models\Answer;
use App\Models\Result;
use App\Models\ReponseEtudiant;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'student') {
            $classIds = $user->classes()->pluck('classes.id');
            $quizzes = Quiz::whereIn('classe_id', $classIds)
                ->with(['teacher', 'matiere', 'questions.answers'])
                ->with(['results' => function ($query) use ($user) {
                    $query->where('etudiant_id', $user->id);
                }])->get();
        } elseif ($user->role === 'teacher') {
            $quizzes = Quiz::where('professeur_id', $user->id)
                ->with(['classRoom', 'matiere', 'questions.answers'])
                ->get();
        } else {
            $quizzes = Quiz::with(['classRoom', 'matiere', 'teacher', 'questions.answers'])->get();
        }

        return response()->json($quizzes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string',
            'classe_id' => 'required|exists:classes,id',
            'matiere_id' => 'required|exists:matieres,id',
            'questions' => 'required|array',
        ]);

        DB::beginTransaction();
        try {
            $quiz = Quiz::create([
                'titre' => $request->titre,
                'classe_id' => $request->classe_id,
                'matiere_id' => $request->matiere_id,
                'professeur_id' => $request->user()->id
            ]);

            foreach ($request->questions as $q) {
                // validation des points
                $points = isset($q['points']) && is_numeric($q['points']) && $q['points'] > 0 ? (int)$q['points'] : 1;
                
                $question = Question::create([
                    'quiz_id' => $quiz->id,
                    'texte' => $q['texte'],
                    'type' => $q['type'],
                    'points' => $points,
                    'reponse_professeur' => $q['reponse_professeur'] ?? null
                ]);

                if (isset($q['answers']) && is_array($q['answers'])) {
                    foreach ($q['answers'] as $ans) {
                        Answer::create([
                            'question_id' => $question->id,
                            'texte' => $ans['texte'],
                            'est_correct' => $ans['est_correct']
                        ]);
                    }
                }
            }

            DB::commit();
            return response()->json(['message' => 'Quiz créé avec succès', 'quiz' => $quiz->load(['questions.answers', 'matiere', 'classRoom'])], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'titre' => 'required|string',
            'classe_id' => 'required|exists:classes,id',
            'matiere_id' => 'required|exists:matieres,id',
        ]);

        $quiz = Quiz::findOrFail($id);
        if ($quiz->professeur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $quiz->update([
            'titre' => $request->titre,
            'classe_id' => $request->classe_id,
            'matiere_id' => $request->matiere_id,
        ]);

        return response()->json(['message' => 'Quiz modifié avec succès', 'quiz' => $quiz->load(['matiere', 'classRoom', 'questions.answers'])]);
    }

    public function destroy(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);
        if ($quiz->professeur_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $quiz->delete();

        return response()->json(['message' => 'Quiz supprimé avec succès']);
    }

    public function submit(Request $request, $id)
    {
        $request->validate([
            'answers' => 'required|array' 
        ]);

        $quiz = Quiz::findOrFail($id);
        $questions = $quiz->questions()->with('answers')->get();
        
        $totalPointsGained = 0;
        $totalPointsPossible = 0;
        $requiresManualGrading = false;

        DB::beginTransaction();
        try {
            foreach ($questions as $question) {
                $totalPointsPossible += $question->points;
                $pointsGained = 0;
                $isGraded = true;
                $studentAnswer = $request->answers[$question->id] ?? null;

                if ($question->type === 'qcm' || $question->type === 'vrai_faux') {
                    $correctAnswers = $question->answers()->where('est_correct', true)->pluck('id')->toArray();
                    
                    $userAnswersForQ = $studentAnswer ?? [];
                    if (!is_array($userAnswersForQ) && $userAnswersForQ !== null) {
                        $userAnswersForQ = [$userAnswersForQ];
                    }

                    sort($correctAnswers);
                    sort($userAnswersForQ);

                    if (!empty($correctAnswers) && $correctAnswers == $userAnswersForQ) {
                        $pointsGained = $question->points;
                    }
                    $totalPointsGained += $pointsGained;
                    
                    // Fetch the actual text of the selected answers to store in texte_reponse
                    if (!empty($userAnswersForQ)) {
                        $answerTexts = $question->answers()->whereIn('id', $userAnswersForQ)->pluck('texte')->toArray();
                        $responseText = implode(', ', $answerTexts);
                    } else {
                        $responseText = '';
                    }
                    
                } elseif ($question->type === 'question_reponse') {
                    $isGraded = false;
                    $requiresManualGrading = true;
                    $pointsGained = null; // En attente
                    $responseText = $studentAnswer;
                }

                ReponseEtudiant::updateOrCreate(
                    [
                        'etudiant_id' => $request->user()->id,
                        'question_id' => $question->id,
                        'quiz_id' => $quiz->id,
                    ],
                    [
                        'texte_reponse' => $responseText,
                        'note' => $pointsGained, // Les points obtenus pour cette question
                        'est_corrige' => $isGraded
                    ]
                );
            }

            // Note totale (si partiellement manuelle, le total s'ajustera plus tard)
            $result = Result::updateOrCreate(
                [
                    'etudiant_id' => $request->user()->id,
                    'quiz_id' => $quiz->id,
                ],
                [
                    'note' => $requiresManualGrading ? null : round(($totalPointsGained / max(1, $totalPointsPossible)) * 20),
                    'total' => 20, // Toujours sur 20 selon la demande
                    'est_corrige' => !$requiresManualGrading
                ]
            );

            DB::commit();
            return response()->json(['message' => 'Quiz soumis', 'result' => $result]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur: ' . $e->getMessage()], 500);
        }
    }

    public function getSubmissions(Request $request, $id)
    {
        $quiz = Quiz::findOrFail($id);
        
        if ($request->user()->id !== $quiz->professeur_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $results = Result::where('quiz_id', $id)->with('student')->get();
        
        $submissions = [];
        foreach ($results as $result) {
            $answers = ReponseEtudiant::where('quiz_id', $id)
                        ->where('etudiant_id', $result->etudiant_id)
                        ->with('question')
                        ->get();
            
            $submissions[] = [
                'result' => $result,
                'student' => $result->student,
                'answers' => $answers,
                'total_points_possible' => $quiz->questions()->sum('points')
            ];
        }

        return response()->json($submissions);
    }

    public function gradeSubmission(Request $request, $quiz_id, $student_id)
    {
        $request->validate([
            'grades' => 'required|array' // tableau clé=question_id, valeur=points_obtenus
        ]);

        $quiz = Quiz::findOrFail($quiz_id);
        if ($request->user()->id !== $quiz->professeur_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $questions = $quiz->questions;
        $totalPointsPossible = $questions->sum('points');
        $totalPointsGained = 0;

        DB::beginTransaction();
        try {
            foreach ($questions as $question) {
                $reponseEtudiant = ReponseEtudiant::where('quiz_id', $quiz_id)
                    ->where('etudiant_id', $student_id)
                    ->where('question_id', $question->id)
                    ->first();

                if (!$reponseEtudiant) continue;

                if ($question->type === 'question_reponse') {
                    $assignedPoints = $request->grades[$question->id] ?? 0;
                    // Limiter les points au max de la question
                    $assignedPoints = min(max(0, $assignedPoints), $question->points);
                    
                    $reponseEtudiant->note = $assignedPoints;
                    $reponseEtudiant->est_corrige = true;
                    $reponseEtudiant->save();
                    
                    $totalPointsGained += $assignedPoints;
                } else {
                    // C'est déjà corrigé, on prend ses points gagnés
                    $totalPointsGained += $reponseEtudiant->note ?? 0;
                }
            }

            // Mettre à jour le résultat final sur 20
            $result = Result::where('quiz_id', $quiz_id)->where('etudiant_id', $student_id)->firstOrFail();
            $result->note = round(($totalPointsGained / max(1, $totalPointsPossible)) * 20);
            $result->est_corrige = true;
            $result->save();

            DB::commit();
            return response()->json(['message' => 'Correction enregistrée', 'final_score' => $result->note]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur: ' . $e->getMessage()], 500);
        }
    }
}
