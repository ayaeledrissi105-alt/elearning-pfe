<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasApiTokens, HasFactory, Notifiable;
    protected $fillable = ["name", "email", "identifier", "plain_password", "password", "role"];
    protected $hidden = ["password", "remember_token"];
    protected function casts(): array { return ["email_verified_at" => "datetime", "password" => "hashed"]; }
    public function courses() { return $this->hasMany(Course::class, "teacher_id"); }
    public function enrollments() { return $this->hasMany(Enrollment::class, "student_id"); }
    public function results() { return $this->hasMany(Result::class, "student_id"); }
    public function comments() { return $this->hasMany(Comment::class); }
    public function classes()
    {
        return $this->belongsToMany(ClassRoom::class, 'classe_utilisateur', 'user_id', 'classe_id');
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class, 'professeur_id');
    }
}
