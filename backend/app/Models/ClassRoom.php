<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassRoom extends Model
{
    use HasFactory;

    protected $table = 'classes';
    protected $fillable = ['nom'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'classe_utilisateur', 'classe_id', 'user_id');
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class, 'class_id');
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class, 'class_id');
    }
}
