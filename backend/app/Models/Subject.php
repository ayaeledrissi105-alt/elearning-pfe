<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $table = 'matieres';
    protected $fillable = ['nom', 'professeur_id'];

    public function professeur()
    {
        return $this->belongsTo(User::class, 'professeur_id');
    }
}
