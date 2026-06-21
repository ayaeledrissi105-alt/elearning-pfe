import React, { useState, useEffect } from 'react';
import { Upload, Users, BookOpen, FileSpreadsheet, UserPlus, Loader2, CheckCircle, ArrowRight, Shield, GraduationCap, LayoutDashboard, Trash2, Edit2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('import'); // import, etudiants, professeurs
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', identifier: '', email: '', password: '', classe_id: '', filieres: [] });
  const [editingLoader, setEditingLoader] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);

  // Static Filières
  const filieresList = ['DWFS', 'EII', 'CG', 'GMP', 'Toutes les filières'];

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchData();
  }, []);

  // ... (keeping other things intact, just need to update the sidebar HTML below)

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/data');
      setClasses(res.data.classes);
      setStudents(res.data.students);
      setTeachers(res.data.teachers);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchData(); // Refresh list after deletion
    } catch (err) {
      alert("Erreur lors de la suppression: " + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin');
  };

  // ----- EXCEL IMPORT LOGIC -----
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [generatedStudents, setGeneratedStudents] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setImportMessage('');
    setGeneratedStudents([]);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const normalizedData = data.map(row => {
        const rowKeys = Object.keys(row);
        let nom = '', prenom = '', code_massar = '';
        rowKeys.forEach(key => {
          const k = key.toLowerCase().trim();
          if (k.includes('nom')) nom = row[key];
          if (k.includes('prenom') || k.includes('prénom')) prenom = row[key];
          if (k.includes('massar') || k.includes('code')) code_massar = row[key];
        });
        return { nom, prenom, code_massar };
      }).filter(s => s.code_massar);

      setParsedData(normalizedData);
    };
    reader.readAsBinaryString(selectedFile);
  };

  const submitImport = async () => {
    if (!selectedClass) {
      setImportMessage("Erreur: Veuillez sélectionner une classe.");
      return;
    }
    setImporting(true);
    try {
      const response = await api.post('/admin/import-students', {
        class_id: selectedClass,
        students: parsedData
      });
      setImportMessage(response.data.message);
      setGeneratedStudents(response.data.students || []);
      setParsedData([]);
      setFile(null);
      fetchData(); // refresh
    } catch (err) {
      setImportMessage("Erreur lors de l'importation: " + (err.response?.data?.message || err.message));
    } finally {
      setImporting(false);
    }
  };

  // ----- TEACHER FORM LOGIC -----
  const [teacherForm, setTeacherForm] = useState({ name: '', filieres: [] });
  const [addingTeacher, setAddingTeacher] = useState(false);
  const [teacherMsg, setTeacherMsg] = useState('');

  const submitTeacher = async (e) => {
    e.preventDefault();
    if (teacherForm.filieres.length === 0) {
      setTeacherMsg("Erreur: Veuillez sélectionner au moins une filière.");
      return;
    }
    
    // Transform "Toutes les filières" to "ALL"
    let payloadFilieres = [...teacherForm.filieres];
    if (payloadFilieres.includes('Toutes les filières')) {
      payloadFilieres = ['ALL'];
    }

    setAddingTeacher(true);
    setTeacherMsg('');
    try {
      const response = await api.post('/admin/teachers', {
        name: teacherForm.name,
        filieres: payloadFilieres
      });
      setTeacherMsg(response.data.message);
      setTeacherForm({ name: '', filieres: [] });
      fetchData();
      setTimeout(() => {
        setShowAddTeacherModal(false);
        setTeacherMsg('');
      }, 1500);
    } catch (err) {
      setTeacherMsg("Erreur: " + (err.response?.data?.message || err.message));
    } finally {
      setAddingTeacher(false);
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    let fils = [];
    if (u.role === 'teacher' && u.classes) {
      if (u.classes.length >= 8) fils = ['Toutes les filières'];
      else fils = [...new Set(u.classes.map(c => c.nom.split('-')[0]))];
    }
    setEditForm({
      name: u.name,
      identifier: u.identifier || '',
      email: u.email || '',
      password: '',
      classe_id: u.role === 'student' && u.classes && u.classes.length > 0 ? u.classes[0].id : '',
      filieres: fils
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm({ name: '', identifier: '', email: '', password: '', classe_id: '', filieres: [] });
  };

  const handleEditMultiSelect = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setEditForm({ ...editForm, filieres: value });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setEditingLoader(true);
    try {
      await api.put(`/admin/users/${editingUser.id}`, editForm);
      await fetchData();
      closeEditModal();
    } catch (err) {
      alert("Erreur lors de la modification");
    } finally {
      setEditingLoader(false);
    }
  };

  const handleTeacherMultiSelect = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setTeacherForm({ ...teacherForm, filieres: value });
  };

  // Helper to extract unique prefixes from classes for display
  const extractFilieresFromClasses = (userClasses) => {
    if (!userClasses || userClasses.length === 0) return 'Aucune';
    // If they have 8 classes, it's likely "Toutes les filières"
    if (userClasses.length >= 8) return 'Toutes les filières';
    
    const prefixes = [...new Set(userClasses.map(c => c.nom.split('-')[0]))];
    return prefixes.join(', ');
  };

  // Helper to split Nom/Prénom
  const splitName = (fullName) => {
    const parts = fullName.split(' ');
    if (parts.length === 1) return { prenom: '', nom: parts[0] };
    const prenom = parts[0];
    const nom = parts.slice(1).join(' ');
    return { prenom, nom };
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex font-sans">
      
      {/* PROFESSIONAL SIDEBAR */}
      <aside className="w-72 bg-[#1e1b4b] text-white flex flex-col shadow-2xl z-10 hidden md:flex">
        <div className="p-8 flex items-center gap-4 bg-black/20 border-b border-white/10">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{user ? user.name : 'Directeur'}</h2>
            <p className="text-xs text-indigo-300 font-medium tracking-wider uppercase">Administration</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <div className="text-xs font-bold text-indigo-300/50 uppercase tracking-widest mb-4 ml-2">Gestion Générale</div>
          
          <button 
            onClick={() => setActiveTab('import')} 
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${activeTab === 'import' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-indigo-200 hover:bg-white/5 hover:text-white'}`}
          >
            <FileSpreadsheet className="w-5 h-5" /> Import Excel
          </button>
          
          <button 
            onClick={() => setActiveTab('etudiants')} 
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${activeTab === 'etudiants' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-indigo-200 hover:bg-white/5 hover:text-white'}`}
          >
            <GraduationCap className="w-5 h-5" /> Liste des Étudiants
          </button>

          <button 
            onClick={() => setActiveTab('professeurs')} 
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${activeTab === 'professeurs' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-indigo-200 hover:bg-white/5 hover:text-white'}`}
          >
            <UserPlus className="w-5 h-5" /> Gestion Professeurs
          </button>
        </nav>

        <div className="p-6 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-medium transition-all">
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        
        {/* Header / Top bar */}
        <header className="bg-white px-10 py-6 border-b border-gray-200 flex items-center justify-between sticky top-0 z-20">
          <div className="flex flex-col text-gray-800">
            <p className="text-slate-500 font-medium mb-1">Bonjour <span className="font-bold text-bts-primary">{user ? user.name : 'Directeur'}</span>, bienvenue dans votre espace privé</p>
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-6 h-6 text-indigo-600" />
              <h1 className="text-2xl font-bold tracking-tight">
                {activeTab === 'import' && 'Importation des Étudiants'}
                {activeTab === 'etudiants' && 'Base de données Étudiants'}
                {activeTab === 'professeurs' && 'Gestion du Corps Professoral'}
              </h1>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm shadow-sm border border-indigo-100">
              {students.length} Étudiants
            </div>
            <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg font-bold text-sm shadow-sm border border-purple-100">
              {teachers.length} Professeurs
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          
          {/* ---------------- IMPORT TAB ---------------- */}
          {activeTab === 'import' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                
                {importMessage && (
                  <div className={`mb-8 p-4 rounded-xl text-sm font-bold border flex items-center gap-3 ${importMessage.includes('Erreur') ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    {importMessage.includes('Erreur') ? '⚠️' : <CheckCircle className="w-5 h-5"/>} {importMessage}
                  </div>
                )}

                {/* STEP 1 */}
                <div className="mb-10">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm">1</span>
                    Télécharger le fichier Excel
                  </h2>
                  <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-2xl p-10 text-center hover:bg-indigo-50 transition-colors cursor-pointer group relative">
                    <input type="file" accept=".xlsx, .xls, .csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                    <Upload className="w-12 h-12 text-indigo-400 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                    <span className="text-indigo-700 font-bold text-lg block mb-1">Sélectionnez ou glissez un fichier</span>
                    <span className="text-gray-500 text-sm font-medium">{file ? file.name : "Format supporté: .xlsx ou .csv"}</span>
                  </div>
                </div>

                {/* STEP 2 PREVIEW */}
                {parsedData.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 pt-6 border-t border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm">2</span>
                      Aperçu et Assignation
                    </h2>
                    
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6 shadow-sm">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 shadow-sm">
                            <tr>
                              <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs">Nom</th>
                              <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs">Prénom</th>
                              <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs">Code Massar</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {parsedData.map((s, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-900">{s.nom}</td>
                                <td className="px-6 py-3 font-medium text-gray-900">{s.prenom}</td>
                                <td className="px-6 py-3 font-mono text-indigo-600">{s.code_massar}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs font-bold text-gray-500">
                        {parsedData.length} étudiants détectés
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-end bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <div className="flex-1 w-full">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Classe d'assignation</label>
                        <select 
                          value={selectedClass} 
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl p-3.5 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium bg-white"
                        >
                          <option value="">Sélectionnez la classe</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.nom || c.name}</option>)}
                        </select>
                      </div>
                      <button 
                        onClick={submitImport}
                        disabled={importing || !selectedClass}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                      >
                        {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Valider l'importation <ArrowRight className="w-5 h-5" /></>}
                      </button>
                    </div>
                  </div>
                )}

                {/* GENERATED PASSWORDS VIEW */}
                {generatedStudents.length > 0 && (
                  <div className="mt-10 border-t-2 border-green-100 pt-8 animate-in fade-in">
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
                      <h3 className="text-xl font-bold text-green-800 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6"/> Succès : Mots de passe générés
                      </h3>
                      <p className="text-green-700 font-medium mb-6">Veuillez copier ces accès maintenant. Les mots de passe ne seront plus affichés en clair.</p>
                      
                      <div className="bg-white rounded-xl overflow-hidden border border-green-200 shadow-sm max-h-96 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs">Nom Complet</th>
                              <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs">Code Massar</th>
                              <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs">Mot de passe (8-12 chars)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {generatedStudents.map((s, idx) => (
                              <tr key={idx} className="hover:bg-green-50/50">
                                <td className="px-6 py-3 font-bold text-gray-900">{s.name}</td>
                                <td className="px-6 py-3 font-mono text-indigo-600">{s.identifier}</td>
                                <td className="px-6 py-3 font-mono text-green-600 font-bold text-base bg-green-50/50">{s.plain_password}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------- STUDENTS TAB ---------------- */}
          {activeTab === 'etudiants' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs">Nom</th>
                      <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs">Prénom</th>
                      <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs">Code Massar</th>
                      <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs">Classe</th>
                      <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs">Mot de passe initial</th>
                      <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map(s => {
                      const { prenom, nom } = splitName(s.name);
                      return (
                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900">{nom}</td>
                          <td className="px-6 py-4 font-medium text-gray-700">{prenom}</td>
                          <td className="px-6 py-4 font-mono text-indigo-600 bg-indigo-50/30">{s.identifier}</td>
                          <td className="px-6 py-4 font-bold text-gray-600">
                            {s.classes?.map(c => <span key={c.id} className="bg-gray-100 border border-gray-200 px-3 py-1 rounded-full text-xs mr-1">{c.nom}</span>)}
                          </td>
                          <td className="px-6 py-4 font-mono text-green-600 font-bold tracking-wider">{s.plain_password}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => openEditModal(s)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors mr-2">
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => deleteUser(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {students.length === 0 && (
                      <tr><td colSpan="6" className="p-12 text-center text-gray-500 font-medium">Aucun étudiant dans la base de données.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------------- PROFESSORS TAB ---------------- */}
          {activeTab === 'professeurs' && (
            <div className="flex flex-col gap-6 items-start animate-in fade-in slide-in-from-bottom-4">
              
              <div className="w-full flex justify-end">
                <button 
                  onClick={() => setShowAddTeacherModal(true)} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  Ajouter un Professeur
                </button>
              </div>

              {/* Professor Table */}
              <div className="w-full">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs">Nom</th>
                        <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs">Filières (Enseignées)</th>
                        <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs">Code Prof</th>
                        <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs">Email</th>
                        <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs">Password initial</th>
                        <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-wider text-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {teachers.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900">{t.name}</td>
                          <td className="px-6 py-4">
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-xs font-bold inline-block">
                              {extractFilieresFromClasses(t.classes)}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-purple-600 font-bold bg-purple-50/30">{t.identifier}</td>
                          <td className="px-6 py-4 font-medium text-gray-600 text-sm">{t.email}</td>
                          <td className="px-6 py-4 font-mono text-green-600 font-bold tracking-wider">{t.plain_password}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => openEditModal(t)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors mr-2">
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => deleteUser(t.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {teachers.length === 0 && (
                        <tr><td colSpan="6" className="p-12 text-center text-gray-500 font-medium">Aucun professeur.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                Modifier {editingUser.role === 'student' ? 'Étudiant' : 'Professeur'}
              </h2>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitEdit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  required 
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all" 
                />
              </div>

              {editingUser.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Code Massar</label>
                    <input 
                      type="text" 
                      value={editForm.identifier} 
                      onChange={e => setEditForm({...editForm, identifier: e.target.value})} 
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all bg-gray-50" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Classe</label>
                    <select 
                      value={editForm.classe_id} 
                      onChange={e => setEditForm({...editForm, classe_id: e.target.value})} 
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all"
                    >
                      <option value="">Sélectionner une classe</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.nom}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {editingUser.role === 'teacher' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={editForm.email} 
                      onChange={e => setEditForm({...editForm, email: e.target.value})} 
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Filières</label>
                    <select 
                      multiple 
                      value={editForm.filieres} 
                      onChange={handleEditMultiSelect} 
                      className="w-full border border-gray-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium h-32 custom-scrollbar"
                    >
                      {filieresList.map(f => <option key={f} value={f} className="p-2 hover:bg-indigo-50 rounded-lg cursor-pointer mb-1">{f}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nouveau Mot de passe (Laisser vide si inchangé)</label>
                <input 
                  type="text" 
                  value={editForm.password} 
                  onChange={e => setEditForm({...editForm, password: e.target.value})} 
                  placeholder="********"
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all bg-gray-50" 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={closeEditModal} className="px-5 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={editingLoader} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2">
                  {editingLoader ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl md:text-2xl font-black text-gray-800 flex items-center gap-3 whitespace-nowrap">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex justify-center items-center shrink-0">
                  <UserPlus className="w-6 h-6 text-indigo-600" />
                </div>
                Nouveau Professeur
              </h2>
              <button onClick={() => setShowAddTeacherModal(false)} className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-2 rounded-full transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-500 text-sm mb-6 font-medium">Les accès (Code Prof, Email, Mot de passe) seront générés automatiquement.</p>
              
              {teacherMsg && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-bold border flex items-center gap-2 ${teacherMsg.includes('Erreur') ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                  {teacherMsg.includes('Erreur') ? '⚠️' : '✅'} {teacherMsg}
                </div>
              )}

              <form onSubmit={submitTeacher} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet</label>
                  <input 
                    type="text" 
                    value={teacherForm.name} 
                    onChange={e => setTeacherForm({...teacherForm, name: e.target.value})} 
                    required 
                    className="w-full border border-gray-300 rounded-xl p-3.5 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all" 
                    placeholder="Ex: Dr. Martin Dupont" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Filières (Ctrl+Clic pour multi)</label>
                  <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg mb-3 border border-yellow-200 font-medium">
                    Ex: Sélectionner "DWF" assignera automatiquement DWF-1 et DWF-2 au professeur.
                  </div>
                  <select 
                    multiple 
                    required 
                    value={teacherForm.filieres} 
                    onChange={handleTeacherMultiSelect} 
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium h-48 custom-scrollbar"
                  >
                    {filieresList.map(f => <option key={f} value={f} className="p-2 hover:bg-indigo-50 rounded-lg cursor-pointer mb-1">{f}</option>)}
                  </select>
                </div>
                
                <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddTeacherModal(false)} className="px-5 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors">
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={addingTeacher} 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {addingTeacher ? <Loader2 className="w-6 h-6 animate-spin" /> : "Générer Accès & Ajouter"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
