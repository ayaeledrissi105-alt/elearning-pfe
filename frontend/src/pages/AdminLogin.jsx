import React, { useState } from 'react';
import { Shield, ArrowLeft, Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminLogin() {
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

      if (response.data.role !== 'admin') {
        setError("Accès refusé. Vous n'êtes pas administrateur.");
        setLoading(false);
        return;
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard/admin');
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
    <div className="min-h-screen bg-[#0f0c1b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background ambient glow - Admin theme (purple/indigo) */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-[#0f0c1b] pointer-events-none"></div>

      {/* Back button */}
      <div className="absolute top-8 left-8 z-10">
        <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Retour à l'accueil
        </Link>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          <div className="bg-slate-900 p-8 text-center border-b border-slate-800">
            <div className="w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white mb-2">Espace Administrateur</h1>
            <p className="text-slate-400 text-sm font-medium">Accès restreint — Directeur uniquement</p>
          </div>

          <div className="p-8 sm:p-10">
            {/* Form */}
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <Lock className="w-4 h-4 text-slate-400" /> Code administrateur
                </label>
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700"
                  placeholder="Ex: ADMIN2024"
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
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 pr-12"
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 active:scale-[0.98] mt-2 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Accéder au panneau admin"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
