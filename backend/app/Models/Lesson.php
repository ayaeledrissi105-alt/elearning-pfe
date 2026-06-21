<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $table = 'cours';
    protected $fillable = ['titre', 'description', 'type_contenu', 'chemin_fichier', 'classe_id', 'matiere_id', 'professeur_id'];

    public function matiere()
    {
        return $this->belongsTo(Subject::class, 'matiere_id');
    }

    public function class_room()
    {
        return $this->belongsTo(ClassRoom::class, 'classe_id');
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'professeur_id');
    }
}
