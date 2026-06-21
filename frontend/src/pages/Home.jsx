import React from 'react';
import { ExternalLink, Code, Calculator, Wrench, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const formations = [
    { title: "Développement Web Full Stack", icon: <Code className="w-8 h-8 text-bts-primary" /> },
    { title: "Comptabilité et Gestion", icon: <Calculator className="w-8 h-8 text-bts-primary" /> },
    { title: "Génie Mécanique et Productique", icon: <Wrench className="w-8 h-8 text-bts-primary" /> },
    { title: "Électronique & Info. Indus.", icon: <Cpu className="w-8 h-8 text-bts-primary" /> }
  ];

  return (
    <div className="flex flex-col">
      {/* Light Clean Hero Section with Foggy Background */}
      <section className="relative bg-white py-24 lg:py-32 flex flex-col items-center text-center overflow-hidden">
        {/* Background ambient glow (Fog effect) */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-bts-primary/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-bts-primary/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/3"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 opacity-0 animate-fade-in-up">
          {/* Top Pill */}
          <div className="inline-block bg-teal-50 text-bts-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            Votre porte d'entrée vers l'Excellence
          </div>
          
          {/* Headings */}
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-4 tracking-tight">
            Bienvenue à <span className="text-bts-primary">e-learning BTS</span>
          </h1>
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8">
            Votre Plateforme E-Learning
          </h2>
          
          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-12 font-medium opacity-0 animate-fade-in-up delay-100">
            Rejoignez-nous pour entamer un voyage de connaissance et d'innovation
          </p>
          
          <div className="opacity-0 animate-fade-in-up delay-200">
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-bts-primary rounded-full hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Accéder à l'espace personnel
            </Link>
          </div>
        </div>
      </section>

      {/* Notre Établissement Section */}
      <section id="notre-etablissement" className="py-24 bg-bts-gray border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <div className="aspect-[4/3] relative flex items-center justify-center">
                  <img src="/school-image.png" alt="École M6" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="inline-block bg-teal-50 text-bts-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                À propos
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Notre Établissement : L'excellence technique
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Notre établissement prépare les techniciens supérieurs de demain grâce à une pédagogie innovante, des professeurs experts et un environnement propice à la réussite de votre PFE et de votre carrière.
              </p>
              
              <a 
                href="http://btsm6.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-bts-primary bg-teal-50 rounded-full hover:bg-teal-100 transition-colors"
              >
                Découvrir plus sur btsm6.com
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Formations Section */}
      <section id="formations" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Nos Formations</h3>
            <p className="text-gray-500 text-lg">Des filières adaptées aux besoins de l'industrie.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {formations.map((formation, index) => (
              <div key={index} className="group bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {formation.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900">{formation.title}</h4>
                <p className="text-gray-500 mt-2">Formation professionnelle diplômante.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
