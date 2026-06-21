<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReponseEtudiant extends Model
{
    use HasFactory;

    protected $table = 'reponses_etudiants';
    protected $fillable = ['etudiant_id', 'question_id', 'quiz_id', 'texte_reponse', 'note', 'est_corrige'];

    public function student()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }
}
