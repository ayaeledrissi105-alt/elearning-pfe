<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->timestamps();
        });

        Schema::create('matieres', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->foreignId('professeur_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('classe_utilisateur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('classe_id')->constrained('classes')->onDelete('cascade');
            $table->timestamps();
        });



        Schema::create('cours', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->enum('type_contenu', ['pdf', 'video', 'youtube'])->default('pdf');
            $table->string('chemin_fichier')->nullable(); 
            $table->foreignId('classe_id')->constrained('classes')->onDelete('cascade');
            $table->foreignId('matiere_id')->constrained('matieres')->onDelete('cascade');
            $table->foreignId('professeur_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('quiz', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->foreignId('classe_id')->constrained('classes')->onDelete('cascade');
            $table->foreignId('matiere_id')->constrained('matieres')->onDelete('cascade');
            $table->foreignId('professeur_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quiz')->onDelete('cascade');
            $table->text('texte');
            $table->enum('type', ['vrai_faux', 'qcm', 'question_reponse']);
            $table->text('reponse_professeur')->nullable(); 
            $table->integer('points')->default(1);
            $table->timestamps();
        });

        Schema::create('reponses_qcm', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->text('texte');
            $table->boolean('est_correct')->default(false);
            $table->timestamps();
        });

        Schema::create('reponses_etudiants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->foreignId('quiz_id')->constrained('quiz')->onDelete('cascade');
            $table->text('texte_reponse')->nullable();
            $table->integer('note')->nullable();
            $table->boolean('est_corrige')->default(false);
            $table->timestamps();
        });

        Schema::create('resultats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('quiz_id')->constrained('quiz')->onDelete('cascade');
            $table->integer('note')->nullable(); 
            $table->integer('total');
            $table->boolean('est_corrige')->default(true); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resultats');
        Schema::dropIfExists('reponses_etudiants');
        Schema::dropIfExists('reponses_qcm');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('quiz');
        Schema::dropIfExists('cours');
        Schema::dropIfExists('classe_utilisateur');
        Schema::dropIfExists('matieres');
        Schema::dropIfExists('classes');
    }
};
