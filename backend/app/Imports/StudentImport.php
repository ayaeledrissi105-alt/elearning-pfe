<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Str;

class StudentImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // On récupère le Nom, Prénom, et Code Massar.
        // Si les colonnes s'appellent différemment, on s'adapte (ex: 'nom', 'prenom', 'code_massar')
        
        $nom = $row['nom'] ?? '';
        $prenom = $row['prenom'] ?? '';
        $name = trim($prenom . ' ' . $nom) ?: 'Inconnu';
        
        $codeMassar = $row['code_massar'] ?? null;

        if (!$codeMassar) {
            return null; // On ignore les lignes sans code massar
        }

        // On génère un mot de passe aléatoire de 8 caractères
        $plainPassword = Str::random(8);

        return new User([
            'name'           => $name,
            'identifier'     => $codeMassar,
            'role'           => 'student',
            'password'       => Hash::make($plainPassword),
            'plain_password' => $plainPassword, // Stocké en clair uniquement pour affichage immédiat au directeur
        ]);
    }
}
