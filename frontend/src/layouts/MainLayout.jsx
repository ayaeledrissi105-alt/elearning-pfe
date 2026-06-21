import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-bts-secondary leading-tight group-hover:opacity-80 transition-opacity">
                  e-learning
                </span>
                <span className="text-lg font-bold text-bts-primary leading-tight">
                  BTS
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-bts-primary font-medium transition-colors">
                Accueil
              </Link>
              <a href="#notre-etablissement" className="text-gray-600 hover:text-bts-primary font-medium transition-colors">
                Notre Établissement
              </a>
              <a href="#formations" className="text-gray-600 hover:text-bts-primary font-medium transition-colors">
                Nos Formations
              </a>
              <a href="#contact" className="text-gray-600 hover:text-bts-primary font-medium transition-colors">
                Contact
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center">
              <Link
                to="/login" 
                className="bg-bts-primary hover:bg-[#6593a6] text-white px-6 py-2.5 rounded-full font-medium transition-all shadow hover:shadow-lg hover:-translate-y-0.5"
              >
                Espace Personnel
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer / Contact Section */}
      <footer id="contact" className="bg-[#1a1a1a] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
            
            {/* Brand */}
            <div>
              <div className="text-2xl font-bold mb-6">
                <span className="text-white">e-learning</span> <span className="text-bts-primary">BTS</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Plateforme d'apprentissage en ligne dédiée aux étudiants de l'Établissement M6.
              </p>
            </div>

            {/* Contact Info (Matching the dark image exactly) */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-serif mb-8 inline-block border-b-2 border-orange-700 pb-2">Contact</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-gray-300 text-lg leading-relaxed pt-2">
                    Lycée Mohammed VI, Avenue<br/>
                    Mohammadia - Azli, Marrakech<br/>
                    - Maroc
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-gray-300 text-lg font-medium">
                    +212 (0) 7 11 78 11 89
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-gray-300 text-lg font-medium">
                    contact@btsm6.com
                  </p>
                </div>
              </div>
            </div>

          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} e-learning BTS. Tous droits réservés.</p>
            <p className="mt-4 md:mt-0">Développé par <span className="text-white font-medium">Aya El Edrissi & Hanan Ben Badda</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
