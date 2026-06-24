'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('formules');
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [formules, setFormules] = useState([]);
  const [codes, setCodes] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth) setIsAuth(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    // Vérifier le mot de passe (à adapter selon ta config)
    if (password === 'admin123') {
      localStorage.setItem('admin_auth', 'true');
      setIsAuth(true);
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const loadFormules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/formules');
      const data = await res.json();
      setFormules(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCodes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/codes');
      const data = await res.json();
      setCodes(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistorique = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/historique');
      const data = await res.json();
      setHistorique(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuth) return;
    
    switch (activeTab) {
      case 'formules':
        loadFormules();
        break;
      case 'codes':
        loadCodes();
        break;
      case 'historique':
        loadHistorique();
        break;
    }
  }, [activeTab, isAuth]);

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2">🔐 Admin</h1>
          <p className="text-center text-slate-400 mb-8">Connexion sécurisée</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:border-blue-500 outline-none"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 rounded-lg transition"
            >
              Connexion
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🛡️ Admin Panel</h1>
          <div className="flex gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition">
              ← Retour au site
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('admin_auth');
                setIsAuth(false);
              }}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('formules')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'formules'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            📋 Formules
          </button>
          <button
            onClick={() => setActiveTab('codes')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'codes'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            🎟️ Codes Paysafecard
          </button>
          <button
            onClick={() => setActiveTab('historique')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'historique'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            📊 Historique
          </button>
        </div>

        {/* Content */}
        {activeTab === 'formules' && (
          <FormuleTab formules={formules} onReload={loadFormules} />
        )}

        {activeTab === 'codes' && (
          <CodesTab codes={codes} formules={formules} onReload={loadCodes} />
        )}

        {activeTab === 'historique' && (
          <HistoriqueTab historique={historique} formules={formules} />
        )}
      </div>
    </div>
  );
}

function FormuleTab({ formules, onReload }) {
  const [nomForm, setNomForm] = useState('');
  const [descForm, setDescForm] = useState('');
  const [emojiForm, setEmojiForm] = useState('');
  const [codesForm, setCodesForm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('/api/formules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: nomForm,
          description: descForm,
          emoji: emojiForm,
          codes_alloues: parseInt(codesForm)
        })
      });

      setNomForm('');
      setDescForm('');
      setEmojiForm('');
      setCodesForm('');
      onReload();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette formule?')) return;

    try {
      await fetch(`/api/formules/${id}`, { method: 'DELETE' });
      onReload();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Ajouter une formule</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nom (ex: 5 nudes)"
            value={nomForm}
            onChange={(e) => setNomForm(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:border-blue-500 outline-none"
            required
          />
          <input
            type="text"
            placeholder="Emoji"
            maxLength="2"
            value={emojiForm}
            onChange={(e) => setEmojiForm(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:border-blue-500 outline-none"
          />
          <textarea
            placeholder="Description"
            value={descForm}
            onChange={(e) => setDescForm(e.target.value)}
            className="col-span-1 md:col-span-2 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:border-blue-500 outline-none min-h-24"
            required
          />
          <input
            type="number"
            placeholder="Codes alloués"
            value={codesForm}
            onChange={(e) => setCodesForm(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:border-blue-500 outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-3 rounded-lg transition"
          >
            {loading ? 'Ajout...' : 'Ajouter'}
          </button>
        </form>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 font-bold">Formules existantes</div>
        {formules.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Aucune formule</div>
        ) : (
          formules.map((f) => (
            <div key={f.id} className="p-4 border-b border-slate-700 last:border-0 flex justify-between items-center hover:bg-slate-700">
              <div>
                <p className="font-bold">{f.emoji} {f.nom}</p>
                <p className="text-slate-400 text-sm">{f.description}</p>
                <p className="text-slate-500 text-xs mt-1">🎟️ {f.codes_alloues} codes</p>
              </div>
              <button
                onClick={() => handleDelete(f.id)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold transition"
              >
                ✕ Supprimer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CodesTab({ codes, formules, onReload }) {
  const [codesText, setCodesText] = useState('');
  const [formuleId, setFormuleId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formuleId || !codesText.trim()) return;

    setLoading(true);

    const codesList = codesText.split('\n').filter(c => c.trim());

    try {
      for (const code of codesList) {
        await fetch('/api/codes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formule_id: parseInt(formuleId),
            code_value: code.trim()
          })
        });
      }

      setCodesText('');
      setFormuleId('');
      onReload();
      alert(`${codesList.length} code(s) ajouté(s)`);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce code?')) return;

    try {
      await fetch(`/api/codes/${id}`, { method: 'DELETE' });
      onReload();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Ajouter des codes Paysafecard</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={formuleId}
            onChange={(e) => setFormuleId(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
            required
          >
            <option value="">-- Sélectionner une formule --</option>
            {formules.map((f) => (
              <option key={f.id} value={f.id}>
                {f.emoji} {f.nom}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Codes (un par ligne)&#10;XXXX-XXXX-XXXX-XXXX&#10;XXXX-XXXX-XXXX-XXXX"
            value={codesText}
            onChange={(e) => setCodesText(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:border-blue-500 outline-none min-h-32 font-mono"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-3 rounded-lg transition"
          >
            {loading ? 'Ajout...' : 'Ajouter les codes'}
          </button>
        </form>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 font-bold grid grid-cols-4 gap-4">
          <div>Code</div>
          <div>Formule</div>
          <div>Statut</div>
          <div>Action</div>
        </div>
        {codes.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Aucun code</div>
        ) : (
          codes.map((c) => (
            <div key={c.id} className="p-4 border-b border-slate-700 last:border-0 grid grid-cols-4 gap-4 items-center hover:bg-slate-700">
              <div className="font-mono text-sm">{c.code_value}</div>
              <div className="text-sm">{c.formule?.nom || 'N/A'}</div>
              <div className="text-sm">
                <span className={c.status === 'active' ? 'text-green-400' : 'text-red-400'}>
                  {c.status === 'active' ? '● Actif' : '✓ Utilisé'}
                </span>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-semibold transition w-fit"
              >
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function HistoriqueTab({ historique, formules }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700 font-bold grid grid-cols-5 gap-4">
        <div>Code</div>
        <div>Formule</div>
        <div>IP</div>
        <div>Date</div>
        <div>Heure</div>
      </div>
      {historique.length === 0 ? (
        <div className="p-8 text-center text-slate-400">Aucun historique</div>
      ) : (
        historique.map((h, i) => {
          const date = new Date(h.created_at);
          return (
            <div key={i} className="p-4 border-b border-slate-700 last:border-0 grid grid-cols-5 gap-4 text-sm hover:bg-slate-700">
              <div className="font-mono">{h.code_value}</div>
              <div>{h.formule?.nom || 'N/A'}</div>
              <div className="text-slate-400">{h.user_ip}</div>
              <div>{date.toLocaleDateString('fr-FR')}</div>
              <div>{date.toLocaleTimeString('fr-FR')}</div>
            </div>
          );
        })
      )}
    </div>
  );
}
