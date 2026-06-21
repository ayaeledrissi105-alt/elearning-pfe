import React, { useState, useEffect } from 'react';
import { Book, FileText, CheckCircle, LogOut, PlusCircle, Loader2, X, Upload, Edit3, Trash2, Save, LayoutDashboard, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ProfessorDashboard() {
  const [activeTab, setActiveTab] = useState('lessons'); // lessons, quizzes, subjects, submissions
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
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
    fetchSubjects();
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

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
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

  const fetchSubmissions = async (quizId) => {
    try {
      const res = await api.get(`/quizzes/${quizId}/submissions`);
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // ---- SUBJECTS ----
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ id: null, nom: '' });
  
  const submitSubject = async (e) => {
    e.preventDefault();
    try {
      if (subjectForm.id) {
        await api.put(`/subjects/${subjectForm.id}`, { nom: subjectForm.nom });
      } else {
        await api.post('/subjects', { nom: subjectForm.nom });
      }
      fetchSubjects();
      setShowSubjectModal(false);
      setSubjectForm({ id: null, nom: '' });
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const deleteSubject = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette matière ? Ses cours et quiz associés seront également supprimés.")) {
      try {
        await api.delete(`/subjects/${id}`);
        fetchSubjects();
        fetchLessons();
        fetchQuizzes();
      } catch (err) {
        alert("Erreur: " + err.message);
      }
    }
  };

  // ---- LESSONS ----
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({ id: null, titre: '', description: '', classe_id: '', matiere_id: '', type_contenu: 'pdf', lien: '', file: null });
  const [creatingLesson, setCreatingLesson] = useState(false);

  const submitLesson = async (e) => {
    e.preventDefault();
    setCreatingLesson(true);
    try {
      if (lessonForm.id) {
        // Update
        await api.put(`/lessons/${lessonForm.id}`, {
          titre: lessonForm.titre,
          description: lessonForm.description,
          classe_id: lessonForm.classe_id,
          matiere_id: lessonForm.matiere_id
        });
      } else {
        // Create
        const formData = new FormData();
        formData.append('titre', lessonForm.titre);
        formData.append('description', lessonForm.description);
        formData.append('classe_id', lessonForm.classe_id);
        formData.append('matiere_id', lessonForm.matiere_id);
        formData.append('type_contenu', lessonForm.type_contenu);
        
        if (lessonForm.type_contenu === 'youtube') {
          formData.append('lien', lessonForm.lien);
        } else if (lessonForm.file) {
          formData.append('file', lessonForm.file);
        }

        await api.post('/lessons', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setLessonForm({ id: null, titre: '', description: '', classe_id: '', matiere_id: '', type_contenu: 'pdf', lien: '', file: null });
      setShowLessonModal(false);
      fetchLessons();
    } catch (err) {
      alert("Erreur: " + (err.response?.data?.message || err.message));
    } finally {
      setCreatingLesson(false);
    }
  };

  const deleteLesson = async (id) => {
    if (window.confirm("Supprimer ce cours ?")) {
      try {
        await api.delete(`/lessons/${id}`);
        fetchLessons();
      } catch (err) {
        alert("Erreur: " + err.message);
      }
    }
  };

  const openLessonEdit = (l) => {
    setLessonForm({
      id: l.id,
      titre: l.titre,
      description: l.description,
      classe_id: l.classe_id,
      matiere_id: l.matiere_id,
      type_contenu: l.type_contenu,
      lien: l.type_contenu === 'youtube' ? l.chemin_fichier : '',
      file: null
    });
    setShowLessonModal(true);
  };

  // ---- QUIZZES ----
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState({ id: null, titre: '', classe_id: '', matiere_id: '', questions: [] });
  const [creatingQuiz, setCreatingQuiz] = useState(false);

  const addQuestion = (type) => {
    const newQuestion = {
      texte: '',
      type,
      points: 1,
      reponse_professeur: '',
      answers: type === 'vrai_faux' 
        ? [{ texte: 'Vrai', est_correct: true }, { texte: 'Faux', est_correct: false }]
        : (type === 'qcm' ? [{ texte: '', est_correct: false }, { texte: '', est_correct: false }] : [])
    };
    setQuizForm({ ...quizForm, questions: [...quizForm.questions, newQuestion] });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...quizForm.questions];
    newQuestions[index][field] = value;
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  const addQcmAnswer = (qIndex) => {
    const newQuestions = [...quizForm.questions];
    newQuestions[qIndex].answers.push({ texte: '', est_correct: false });
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  const updateQcmAnswerText = (qIndex, aIndex, text) => {
    const newQuestions = [...quizForm.questions];
    newQuestions[qIndex].answers[aIndex].texte = text;
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  const setCorrectQcmAnswer = (qIndex, aIndex) => {
    const newQuestions = [...quizForm.questions];
    newQuestions[qIndex].answers.forEach(a => a.est_correct = false);
    newQuestions[qIndex].answers[aIndex].est_correct = true;
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  const setCorrectVFAnswer = (qIndex, isTrueCorrect) => {
    const newQuestions = [...quizForm.questions];
    newQuestions[qIndex].answers[0].est_correct = isTrueCorrect; 
    newQuestions[qIndex].answers[1].est_correct = !isTrueCorrect; 
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  const removeQuestion = (index) => {
    const newQuestions = quizForm.questions.filter((_, i) => i !== index);
    setQuizForm({ ...quizForm, questions: newQuestions });
  };

  const submitQuiz = async (e) => {
    e.preventDefault();
    setCreatingQuiz(true);
    try {
      if (quizForm.id) {
        await api.put(`/quizzes/${quizForm.id}`, {
          titre: quizForm.titre,
          classe_id: quizForm.classe_id,
          matiere_id: quizForm.matiere_id
        });
      } else {
        // Validate points
        const invalidQuestion = quizForm.questions.find(q => !q.points || q.points < 1);
        if (invalidQuestion) {
          alert("Toutes les questions doivent avoir un nombre de points supérieur à 0.");
          setCreatingQuiz(false);
          return;
        }
        await api.post('/quizzes', quizForm);
      }
      setQuizForm({ id: null, titre: '', classe_id: '', matiere_id: '', questions: [] });
      setShowQuizModal(false);
      fetchQuizzes();
    } catch (err) {
      alert("Erreur: " + (err.response?.data?.message || err.message));
    } finally {
      setCreatingQuiz(false);
    }
  };

  const deleteQuiz = async (id) => {
    if (window.confirm("Supprimer ce quiz ?")) {
      try {
        await api.delete(`/quizzes/${id}`);
        fetchQuizzes();
      } catch (err) {
        alert("Erreur: " + err.message);
      }
    }
  };

  const openQuizEdit = (q) => {
    setQuizForm({
      id: q.id,
      titre: q.titre,
      classe_id: q.classe_id,
      matiere_id: q.matiere_id,
      questions: [] // Edit only affects metadata for now, or you'd fetch questions.
    });
    setShowQuizModal(true);
  };

  // ---- GRADING ----
  const [gradingScores, setGradingScores] = useState({});
  
  const handleGradeChange = (studentId, questionId, value) => {
    setGradingScores(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [questionId]: value
      }
    }));
  };

  const saveGrades = async (quizId, studentId) => {
    try {
      const grades = gradingScores[studentId] || {};
      const res = await api.post(`/quizzes/${quizId}/submissions/${studentId}/grade`, { grades });
      alert("Note globale sur 20 calculée et enregistrée : " + res.data.final_score + "/20");
      fetchSubmissions(quizId);
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0f1c] text-white border-r border-slate-800 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2"><LayoutDashboard className="w-6 h-6"/> Dashboard</h2>
          <div className="mt-4">
            <p className="text-slate-400 text-sm">Professeur : <span className="text-white font-bold">{user.name}</span></p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab('lessons')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'lessons' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Book className="w-5 h-5" /> Les Cours
          </button>
          <button onClick={() => setActiveTab('quizzes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'quizzes' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>
            <FileText className="w-5 h-5" /> Les Quiz
          </button>
          <button onClick={() => setActiveTab('subjects')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'subjects' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Database className="w-5 h-5" /> Matières
          </button>
          <button onClick={() => setActiveTab('submissions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'submissions' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>
            <CheckCircle className="w-5 h-5" /> Correction
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg font-medium">
            <LogOut className="w-5 h-5" /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="bg-white px-8 py-6 border-b border-gray-200 sticky top-0 z-10 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Espace Professeur</h1>
            <p className="text-slate-500 mt-1 font-medium">Bonjour <span className="font-bold text-bts-primary">{user.name}</span>, bienvenue dans votre espace privé</p>
          </div>
          {activeTab === 'subjects' && (
            <button onClick={() => { setSubjectForm({id: null, nom: ''}); setShowSubjectModal(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition">
              <PlusCircle className="w-5 h-5" /> Ajouter Matière
            </button>
          )}
          {activeTab === 'lessons' && (
            <button onClick={() => { setLessonForm({ id: null, titre: '', description: '', classe_id: '', matiere_id: '', type_contenu: 'pdf', lien: '', file: null }); setShowLessonModal(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition">
              <PlusCircle className="w-5 h-5" /> Ajouter Cours
            </button>
          )}
          {activeTab === 'quizzes' && (
            <button onClick={() => { setQuizForm({ id: null, titre: '', classe_id: '', matiere_id: '', questions: [] }); setShowQuizModal(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition">
              <PlusCircle className="w-5 h-5" /> Ajouter Quiz
            </button>
          )}
        </header>

        <div className="p-8">

          {/* TAB: MATIERES */}
          {activeTab === 'subjects' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Mes Matières</h2>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 font-medium">
                    <tr>
                      <th className="p-4">Nom de la matière</th>
                      <th className="p-4 w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subjects.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-800">{s.nom}</td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => { setSubjectForm({id: s.id, nom: s.nom}); setShowSubjectModal(true); }} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg"><Edit3 className="w-4 h-4"/></button>
                          <button onClick={() => deleteSubject(s.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                        </td>
                      </tr>
                    ))}
                    {subjects.length === 0 && <tr><td colSpan="2" className="p-8 text-center text-slate-500">Aucune matière créée.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: LESSONS */}
          {activeTab === 'lessons' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Mes Cours publiés</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {lessons.map(l => (
                  <div key={l.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-slate-800">{l.titre}</h3>
                        <div className="flex gap-1">
                          <button onClick={() => openLessonEdit(l)} className="text-slate-400 hover:text-indigo-600"><Edit3 className="w-4 h-4"/></button>
                          <button onClick={() => deleteLesson(l.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">{l.class_room?.nom}</span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold border border-emerald-100">{l.matiere?.nom}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{l.description}</p>
                    </div>
                    {l.type_contenu === 'youtube' ? (
                      <a href={l.file_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-red-50 text-red-700 text-sm font-bold rounded-lg hover:bg-red-100 transition">
                        Lien YouTube
                      </a>
                    ) : (
                      <a href={l.file_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition">
                        Voir le {l.type_contenu.toUpperCase()}
                      </a>
                    )}
                  </div>
                ))}
                {lessons.length === 0 && <p className="text-slate-500">Aucun cours.</p>}
              </div>
            </div>
          )}

          {/* TAB: QUIZZES */}
          {activeTab === 'quizzes' && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Mes Quiz créés</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {quizzes.map(q => (
                  <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-slate-800">{q.titre}</h3>
                        <div className="flex gap-1">
                          <button onClick={() => openQuizEdit(q)} className="text-slate-400 hover:text-indigo-600"><Edit3 className="w-4 h-4"/></button>
                          <button onClick={() => deleteQuiz(q.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">{q.classRoom?.nom}</span>
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold border border-emerald-100">{q.matiere?.nom}</span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium">{q.questions?.length || 0} questions</p>
                    </div>
                  </div>
                ))}
                {quizzes.length === 0 && <p className="text-slate-500">Aucun quiz.</p>}
              </div>
            </div>
          )}

          {/* TAB: SUBMISSIONS / CORRECTION */}
          {activeTab === 'submissions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 bg-slate-50 border-b font-bold text-slate-800">Quiz à corriger</div>
                <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
                  {quizzes.map(q => (
                    <button key={q.id} onClick={() => { setSelectedQuiz(q); fetchSubmissions(q.id); }} className={`w-full text-left p-4 hover:bg-indigo-50 transition-colors flex justify-between items-center ${selectedQuiz?.id === q.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}>
                      <div>
                        <p className="font-bold text-slate-800">{q.titre}</p>
                        <p className="text-xs text-slate-500">{q.classRoom?.nom} • {q.matiere?.nom}</p>
                      </div>
                    </button>
                  ))}
                  {quizzes.length === 0 && <p className="p-4 text-slate-500 text-sm">Aucun quiz.</p>}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-8 max-h-[80vh] overflow-y-auto pr-4 pb-12">
                {!selectedQuiz ? (
                  <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">Sélectionnez un quiz pour voir les soumissions.</div>
                ) : (
                  <>
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <h3 className="text-xl font-bold text-slate-800">Copies soumises pour : {selectedQuiz.titre}</h3>
                      <span className="bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1 rounded-full">{submissions.length} copie(s)</span>
                    </div>
                    
                    {submissions.map((sub, index) => (
                      <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 mt-6 relative">
                        {/* "Document" Header */}
                        <div className="bg-slate-800 p-6 text-white flex justify-between items-end border-b-4 border-indigo-500">
                          <div>
                            <p className="text-indigo-300 text-sm font-bold uppercase tracking-wider mb-1">Copie d'examen</p>
                            <h4 className="text-2xl font-bold">{sub.student.name}</h4>
                            <p className="text-slate-400 text-sm mt-1">Matricule : {sub.student.identifier}</p>
                          </div>
                          <div className="text-right">
                            {sub.result.est_corrige ? (
                              <div className="bg-green-500 text-white font-black text-xl px-4 py-2 rounded-lg shadow-inner">
                                Note : {sub.result.note} / 20
                              </div>
                            ) : (
                              <div className="bg-orange-500 text-white font-bold px-4 py-2 rounded-lg shadow-inner">
                                En attente
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* "Document" Body */}
                        <div className="p-8 space-y-8 bg-slate-50">
                          {sub.answers.map((ans, i) => (
                            <div key={i} className="bg-white p-6 rounded border border-gray-200 shadow-sm">
                              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                                <p className="font-bold text-slate-800 text-lg">Question {i+1} : <span className="font-normal text-slate-700">{ans.question?.texte}</span></p>
                                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full whitespace-nowrap">{ans.question?.points} pts</span>
                              </div>
                              
                              <div className="mb-4">
                                <span className="font-bold text-slate-400 uppercase text-xs tracking-wider block mb-2">Réponse de l'étudiant</span>
                                <p className="text-slate-800 font-medium text-base bg-slate-50 p-4 rounded border border-slate-100">
                                  {ans.texte_reponse || <span className="italic text-slate-400">Aucune réponse fournie</span>}
                                </p>
                              </div>
                              
                              {ans.question?.type === 'question_reponse' ? (
                                <div className="mt-4 flex items-center justify-between bg-orange-50 p-4 rounded border border-orange-200">
                                  <div className="text-sm">
                                    <span className="font-bold text-orange-800 block mb-1">Correction Manuelle</span>
                                    {ans.question.reponse_professeur && (
                                      <span className="text-orange-600 italic block mt-1">Réf: {ans.question.reponse_professeur}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number" min="0" max={ans.question.points}
                                      className="w-20 border border-orange-300 rounded p-2 text-center font-bold text-lg text-orange-900 bg-white shadow-inner focus:ring-2 focus:ring-orange-500 outline-none"
                                      value={gradingScores[sub.student.id]?.[ans.question.id] !== undefined ? gradingScores[sub.student.id][ans.question.id] : (ans.note ?? '')}
                                      onChange={(e) => handleGradeChange(sub.student.id, ans.question.id, e.target.value)}
                                    />
                                    <span className="text-lg font-bold text-orange-800">/ {ans.question.points}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-4 flex justify-end">
                                  <div className={`px-4 py-2 rounded font-bold text-sm ${ans.note > 0 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                    Correction Auto : {ans.note ?? 0} / {ans.question?.points} pts
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {!sub.result.est_corrige && (
                          <div className="p-6 bg-slate-100 border-t border-slate-200 flex justify-end">
                            <button onClick={() => saveGrades(selectedQuiz.id, sub.student.id)} className="bg-indigo-600 text-white font-bold px-8 py-3 rounded shadow hover:bg-indigo-700 transition transform hover:-translate-y-0.5">
                              Valider la copie et calculer la note sur 20
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {submissions.length === 0 && <p className="text-center text-slate-500 py-10">Aucune soumission reçue pour le moment.</p>}
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL: SUBJECT */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={submitSubject} className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-lg">{subjectForm.id ? 'Modifier la matière' : 'Nouvelle matière'}</h2>
              <button type="button" onClick={() => setShowSubjectModal(false)}><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Nom de la matière</label>
              <input required type="text" value={subjectForm.nom} onChange={e => setSubjectForm({...subjectForm, nom: e.target.value})} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: Mathématiques" />
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
              <button type="button" onClick={() => setShowSubjectModal(false)} className="px-4 py-2 border rounded-lg font-medium hover:bg-gray-100">Annuler</button>
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700">Enregistrer</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: LESSON */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <form onSubmit={submitLesson} className="bg-white rounded-xl shadow-xl w-full max-w-lg my-8">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 sticky top-0">
              <h2 className="font-bold text-lg">{lessonForm.id ? 'Modifier le cours' : 'Ajouter un cours'}</h2>
              <button type="button" onClick={() => setShowLessonModal(false)}><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Titre</label>
                <input required type="text" value={lessonForm.titre} onChange={e => setLessonForm({...lessonForm, titre: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Classe ciblée</label>
                  <select required value={lessonForm.classe_id} onChange={e => setLessonForm({...lessonForm, classe_id: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Sélectionner</option>
                    {user.classes?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Matière</label>
                  <select required value={lessonForm.matiere_id} onChange={e => setLessonForm({...lessonForm, matiere_id: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Sélectionner</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea required value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} className="w-full border rounded-lg p-2.5 h-20 outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
              </div>

              {!lessonForm.id && (
                <div className="p-4 bg-slate-50 border rounded-xl">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Type de contenu</label>
                  <div className="flex gap-4 mb-4">
                    {['pdf', 'video', 'youtube'].map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                        <input type="radio" name="type" checked={lessonForm.type_contenu === type} onChange={() => setLessonForm({...lessonForm, type_contenu: type, file: null, lien: ''})} className="text-indigo-600 focus:ring-indigo-500"/>
                        {type.toUpperCase()}
                      </label>
                    ))}
                  </div>
                  
                  {lessonForm.type_contenu === 'youtube' ? (
                    <div>
                      <input type="url" required placeholder="https://youtube.com/watch?v=..." value={lessonForm.lien} onChange={e => setLessonForm({...lessonForm, lien: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors">
                      <input required type="file" onChange={e => setLessonForm({...lessonForm, file: e.target.files[0]})} accept={lessonForm.type_contenu === 'pdf' ? '.pdf' : 'video/*'} className="text-sm" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end gap-2 sticky bottom-0">
              <button type="button" onClick={() => setShowLessonModal(false)} className="px-4 py-2 border rounded-lg font-medium hover:bg-gray-100">Annuler</button>
              <button type="submit" disabled={creatingLesson} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2">
                {creatingLesson && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: QUIZ */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <form onSubmit={submitQuiz} className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <h2 className="font-bold text-lg">{quizForm.id ? 'Modifier le Quiz (Infos de base)' : 'Créer un Quiz'}</h2>
              <button type="button" onClick={() => setShowQuizModal(false)}><X className="w-5 h-5 text-slate-400"/></button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Titre du Quiz</label>
                  <input type="text" required value={quizForm.titre} onChange={e => setQuizForm({...quizForm, titre: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Classe ciblée</label>
                  <select required value={quizForm.classe_id} onChange={e => setQuizForm({...quizForm, classe_id: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Sélectionner</option>
                    {user.classes?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Matière</label>
                  <select required value={quizForm.matiere_id} onChange={e => setQuizForm({...quizForm, matiere_id: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Sélectionner</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                  </select>
                </div>
              </div>

              {!quizForm.id && (
                <>
                  <div className="space-y-6 mb-6">
                    {quizForm.questions.map((q, qIndex) => (
                      <div key={qIndex} className="p-5 border border-slate-200 rounded-xl bg-slate-50 relative">
                        <button type="button" onClick={() => removeQuestion(qIndex)} className="absolute top-2 right-2 text-red-500 hover:bg-red-100 p-1 rounded"><X className="w-4 h-4"/></button>
                        
                        <div className="flex gap-4 items-start mb-4">
                          <div className="flex-1">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Question {qIndex + 1} ({q.type})</label>
                            <input type="text" required value={q.texte} onChange={e => updateQuestion(qIndex, 'texte', e.target.value)} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Entrez la question..." />
                          </div>
                          <div className="w-24">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Points</label>
                            <input type="number" required min="1" value={q.points} onChange={e => updateQuestion(qIndex, 'points', parseInt(e.target.value))} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700" />
                          </div>
                        </div>

                        {q.type === 'vrai_faux' && (
                          <div className="flex gap-4">
                            <label className={`flex-1 p-2 border rounded cursor-pointer text-center font-bold ${q.answers[0].est_correct ? 'bg-green-100 text-green-800 border-green-500' : 'bg-white'}`}>
                              <input type="radio" className="hidden" checked={q.answers[0].est_correct} onChange={() => setCorrectVFAnswer(qIndex, true)}/> Vrai est correct
                            </label>
                            <label className={`flex-1 p-2 border rounded cursor-pointer text-center font-bold ${q.answers[1].est_correct ? 'bg-green-100 text-green-800 border-green-500' : 'bg-white'}`}>
                              <input type="radio" className="hidden" checked={q.answers[1].est_correct} onChange={() => setCorrectVFAnswer(qIndex, false)}/> Faux est correct
                            </label>
                          </div>
                        )}

                        {q.type === 'qcm' && (
                          <div className="space-y-2">
                            {q.answers.map((a, aIndex) => (
                              <div key={aIndex} className="flex gap-2 items-center">
                                <input type="radio" required name={`q_${qIndex}`} checked={a.est_correct} onChange={() => setCorrectQcmAnswer(qIndex, aIndex)} className="w-4 h-4 text-indigo-600"/>
                                <input type="text" required value={a.texte} onChange={e => updateQcmAnswerText(qIndex, aIndex, e.target.value)} className="flex-1 border rounded p-2 text-sm" placeholder={`Option ${aIndex + 1}`}/>
                              </div>
                            ))}
                            <button type="button" onClick={() => addQcmAnswer(qIndex)} className="text-sm text-indigo-600 font-bold mt-2">+ Option</button>
                          </div>
                        )}

                        {q.type === 'question_reponse' && (
                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1 mt-2">Corrigé (référence pour vous)</label>
                            <textarea value={q.reponse_professeur} onChange={e => updateQuestion(qIndex, 'reponse_professeur', e.target.value)} className="w-full border rounded-lg p-2.5 outline-none text-sm h-16"></textarea>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                    <button type="button" onClick={() => addQuestion('qcm')} className="bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-lg hover:bg-indigo-100 text-sm border border-indigo-200">+ QCM</button>
                    <button type="button" onClick={() => addQuestion('vrai_faux')} className="bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-lg hover:bg-indigo-100 text-sm border border-indigo-200">+ Vrai/Faux</button>
                    <button type="button" onClick={() => addQuestion('question_reponse')} className="bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-lg hover:bg-indigo-100 text-sm border border-indigo-200">+ Question Ouverte</button>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end gap-2 sticky bottom-0 z-10">
              <button type="button" onClick={() => setShowQuizModal(false)} className="px-4 py-2 border rounded-lg font-medium hover:bg-gray-100">Annuler</button>
              <button type="submit" disabled={creatingQuiz || (!quizForm.id && quizForm.questions.length === 0)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50">
                {creatingQuiz && <Loader2 className="w-4 h-4 animate-spin"/>} Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
