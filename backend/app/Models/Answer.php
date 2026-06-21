<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;

    protected $table = 'reponses_qcm';
    protected $fillable = ['question_id', 'texte', 'est_correct'];

    public function question()
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
