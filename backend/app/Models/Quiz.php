<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $table = 'quiz';
    protected $fillable = ['titre', 'classe_id', 'matiere_id', 'professeur_id'];

    public function matiere()
    {
        return $this->belongsTo(Subject::class, 'matiere_id');
    }

    public function classRoom()
    {
        return $this->belongsTo(ClassRoom::class, 'classe_id');
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'professeur_id');
    }

    public function questions()
    {
        return $this->hasMany(Question::class, 'quiz_id');
    }

    public function results()
    {
        return $this->hasMany(Result::class, 'quiz_id');
    }
}
