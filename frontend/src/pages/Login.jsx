import React, { useState } from 'react';
import { GraduationCap, BookOpen, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', {
        identifier,
        password
      });

      // Save token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Navigate based on role returned by backend
      const userRole = response.data.role;
      if (userRole === 'student') navigate('/dashboard/student');
      else if (userRole === 'teacher') navigate('/dashboard/prof');
      else if (userRole === 'admin') navigate('/dashboard/admin');

    } catch (err) {
      if (err.response?.data?.errors) {
        setError(Object.values(err.response.data.errors)[0][0]);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Une erreur de connexion s'est produite.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bts-gray flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background ambient glow (brouillard) */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-bts-primary/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-bts-primary/15 rounded-full blur-[120px]"></div>

      {/* Back button */}
      <div className="absolute top-8 left-8 z-20">
        <Link to="/" className="text-slate-500 hover:text-bts-primary font-bold flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Retour à l'accueil
        </Link>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <img src="/logo.png" alt="Logo BTS" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Connexion</h1>
            <p className="text-slate-500 font-medium">e-learning — Établissement M6 BTS</p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
                role === 'student' 
                  ? 'bg-white text-bts-primary shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Espace Étudiant
            </button>
            <button
              onClick={() => setRole('teacher')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-lg transition-all ${
                role === 'teacher' 
                  ? 'bg-white text-bts-primary shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Espace Professeur
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                <span className="text-bts-primary">#</span> {role === 'student' ? 'Code Massar' : 'Code Professeur'}
              </label>
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-bts-primary/20 focus:border-bts-primary transition-all font-medium text-slate-700"
                placeholder={role === 'student' ? "Ex: J123456789" : "Ex: P987654"}
                required
              />
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-bts-primary/20 focus:border-bts-primary transition-all font-medium text-slate-700 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-bts-primary hover:bg-[#6593a6] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-bts-primary/30 active:scale-[0.98] mt-2 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Se connecter"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 font-medium mt-8 leading-relaxed">
            Utilisez votre {role === 'student' ? 'Code Massar' : 'Code Professeur'} et le mot de passe fourni par le directeur.
          </p>

        </div>
      </div>
    </div>
  );
}
