import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, UserCircle, LogOut, CheckCircle, ArrowRight, Loader2, BrainCircuit, Edit3, Video, Link as LinkIcon, File } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('lessons'); // lessons, quizzes
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/');
    }
    fetchUser();
    fetchLessons();
    fetchQuizzes();
  }, [navigate]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/user');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await api.get('/lessons');
      setLessons(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/quizzes');
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // ----- QUIZ TAKING LOGIC -----
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: [answerId] } or { questionId: "text" }
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setQuizResult(null);
  };

  const selectAnswer = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: [answerId] 
    }));
  };

  const writeAnswer = (questionId, text) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: text 
    }));
  };

  const submitQuizAnswers = async () => {
    if (Object.keys(answers).length !== activeQuiz.questions.length) {
      alert("Veuillez répondre à toutes les questions avant de soumettre.");
      return;
    }
    setSubmittingQuiz(true);
    try {
      const res = await api.post(`/quizzes/${activeQuiz.id}/submit`, { answers });
      setQuizResult(res.data.result);
      fetchQuizzes(); // Refresh to get updated result history
    } catch (err) {
      alert("Erreur lors de la soumission : " + err.message);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setQuizResult(null);
  };

  // Helper to get Youtube embed URL
  const getEmbedUrl = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col">
        <div className="p-8 border-b border-slate-800">
          <h2 className="text-xl font-bold">Espace Étudiant</h2>
          <div className="mt-4">
            <p className="text-slate-300 text-sm font-medium">Nom : <span className="text-white font-bold">{user.name.split(' ').slice(1).join(' ') || user.name}</span></p>
            <p className="text-slate-300 text-sm font-medium">Prénom : <span className="text-white font-bold">{user.name.split(' ')[0]}</span></p>
          </div>
          <div className="mt-3 flex gap-1 flex-wrap">
            {user.classes?.map(c => <span key={c.id} className="text-xs font-bold bg-indigo-500 text-white px-2 py-1 rounded-md">{c.nom || c.name}</span>)}
          </div>
        </div>
        <nav className="flex-1 p-6 space-y-3">
          <button onClick={() => {setActiveTab('lessons'); closeQuiz();}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'lessons' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <BookOpen className="w-5 h-5" /> Mes Cours
          </button>
          <button onClick={() => {setActiveTab('quizzes'); closeQuiz();}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'quizzes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <FileText className="w-5 h-5" /> Quiz & Exercices
          </button>
        </nav>
        <div className="p-6 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-medium transition-colors">
            <LogOut className="w-5 h-5" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        
        {/* Header / Welcome Message */}
        <div className="mb-8 pb-4 border-b border-slate-200">
           <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Espace Étudiant</h1>
           <p className="text-slate-500 mt-1 font-medium">Bonjour <span className="font-bold text-bts-primary">{user.name}</span>, bienvenue dans votre espace privé</p>
        </div>
        {/* LESSONS VIEW */}
        {activeTab === 'lessons' && !activeQuiz && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Mes Cours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {lessons.map(lesson => (
                <div key={lesson.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                  {/* Media Rendering */}
                  <div className="h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                    {lesson.type_contenu === 'youtube' && getEmbedUrl(lesson.file_url) ? (
                      <iframe 
                        className="w-full h-full"
                        src={getEmbedUrl(lesson.file_url)} 
                        title="YouTube video" 
                        allowFullScreen
                      ></iframe>
                    ) : lesson.type_contenu === 'video' ? (
                      <video 
                        className="w-full h-full object-cover" 
                        controls 
                        src={lesson.file_url}
                      ></video>
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        {lesson.type_contenu === 'pdf' ? <File className="w-16 h-16 mb-2"/> : <LinkIcon className="w-16 h-16 mb-2"/>}
                        <span className="font-medium">{lesson.type_contenu?.toUpperCase() || 'DOCUMENT'}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-slate-800">{lesson.titre}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold border border-emerald-100">{lesson.matiere?.nom}</span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">Pr. {lesson.teacher?.name}</span>
                      </div>
                      <p className="text-slate-600 text-sm line-clamp-3 mb-4">{lesson.description}</p>
                    </div>

                    {lesson.type_contenu === 'pdf' && lesson.file_url && (
                      <a href={lesson.file_url} target="_blank" rel="noreferrer" className="block text-center bg-indigo-50 text-indigo-700 font-bold py-2 rounded-lg hover:bg-indigo-100 transition-colors">
                        Ouvrir le PDF
                      </a>
                    )}
                    {lesson.type_contenu === 'youtube' && !getEmbedUrl(lesson.file_url) && (
                      <a href={lesson.file_url} target="_blank" rel="noreferrer" className="block text-center bg-red-50 text-red-700 font-bold py-2 rounded-lg hover:bg-red-100 transition-colors">
                        Ouvrir le lien
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {lessons.length === 0 && <p className="text-slate-500">Aucun cours disponible.</p>}
            </div>
          </div>
        )}

        {/* QUIZZES LIST */}
        {activeTab === 'quizzes' && !activeQuiz && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Quiz & Exercices</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {quizzes.map(quiz => {
                const pastResult = quiz.results && quiz.results.length > 0 ? quiz.results[quiz.results.length - 1] : null;

                return (
                  <div key={quiz.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-500">
                          <FileText className="w-6 h-6" />
                        </div>
                        {pastResult && (
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${pastResult.est_corrige ? 'text-green-600 bg-green-50 border-green-200' : 'text-orange-600 bg-orange-50 border-orange-200'}`}>
                            {pastResult.est_corrige ? (
                              <><CheckCircle className="w-4 h-4" /> Score : {pastResult.note}/{pastResult.total}</>
                            ) : (
                              <><Loader2 className="w-4 h-4 animate-spin" /> En attente de correction</>
                            )}
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{quiz.titre}</h3>
                      <div className="flex flex-wrap gap-2 mb-4 mt-2">
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold border border-emerald-100">{quiz.matiere?.nom}</span>
                      </div>
                      <p className="text-slate-500 text-sm mb-6">Par Pr. {quiz.teacher?.name} • {quiz.questions?.length} Questions</p>
                    </div>
                    
                    <button 
                      onClick={() => startQuiz(quiz)}
                      disabled={pastResult && !pastResult.est_corrige}
                      className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
                    >
                      {pastResult ? (pastResult.est_corrige ? "Refaire le Quiz" : "Correction en cours...") : "Commencer le Quiz"} {!pastResult && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
              {quizzes.length === 0 && <p className="text-slate-500">Aucun quiz disponible pour le moment.</p>}
            </div>
          </div>
        )}

        {/* ACTIVE QUIZ VIEW */}
        {activeQuiz && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-4 z-10">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{activeQuiz.titre}</h1>
                <p className="text-sm text-slate-500">{activeQuiz.matiere?.nom} • Pr. {activeQuiz.teacher?.name}</p>
              </div>
              <button onClick={closeQuiz} className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-lg font-bold transition">Fermer ✕</button>
            </div>

            {quizResult ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 text-center p-12">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Quiz Terminé !</h2>
                {quizResult.est_corrige ? (
                  <>
                    <p className="text-slate-500 mb-8">Voici votre score final.</p>
                    <div className="text-6xl font-black text-indigo-600 mb-10">
                      {quizResult.note} <span className="text-3xl text-slate-300">/ {quizResult.total}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-slate-500 mb-8">Vos réponses ont été soumises et sont en attente de correction manuelle par votre professeur.</p>
                  </>
                )}
                
                <button onClick={closeQuiz} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-10 rounded-xl transition-colors">
                  Retour aux Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {activeQuiz.questions.map((q, qIndex) => (
                  <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-lg font-bold text-slate-800">
                        <span className="text-indigo-500 mr-2">Q{qIndex + 1}.</span> {q.texte}
                      </h3>
                      <span className="bg-slate-100 text-slate-600 font-bold text-xs px-2 py-1 rounded">{q.points} points</span>
                    </div>
                    
                    {q.type === 'question_reponse' ? (
                      <textarea 
                        className="w-full border-2 border-slate-200 rounded-xl p-4 min-h-[150px] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-700"
                        placeholder="Rédigez votre réponse détaillée ici..."
                        value={answers[q.id] || ''}
                        onChange={(e) => writeAnswer(q.id, e.target.value)}
                      ></textarea>
                    ) : (
                      <div className="space-y-3">
                        {q.answers.map(ans => {
                          const isSelected = answers[q.id]?.includes(ans.id);
                          return (
                            <label key={ans.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-300 bg-white'}`}>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-indigo-600' : 'border-slate-300'}`}>
                                {isSelected && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                              </div>
                              <span className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{ans.texte}</span>
                              <input 
                                type="radio" 
                                name={`question_${q.id}`} 
                                className="hidden"
                                checked={isSelected || false}
                                onChange={() => selectAnswer(q.id, ans.id)}
                              />
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                <button 
                  onClick={submitQuizAnswers}
                  disabled={submittingQuiz}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-3 text-lg"
                >
                  {submittingQuiz ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Soumettre mes réponses <CheckCircle className="w-6 h-6" /></>}
                </button>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
