<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Result extends Model
{
    use HasFactory;

    protected $table = 'resultats';
    protected $fillable = ['etudiant_id', 'quiz_id', 'note', 'total', 'est_corrige'];

    public function student()
    {
        return $this->belongsTo(User::class, 'etudiant_id');
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }
}
