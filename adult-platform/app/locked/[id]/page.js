'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LockedContent() {
  const params = useParams();
  const router = useRouter();
  const [formule, setFormule] = useState(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFormule();
  }, [params.id]);

  const loadFormule = async () => {
    try {
      const res = await fetch(`/api/formules/${params.id}`);
      const data = await res.json();
      setFormule(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!code.trim()) {
      setMessage('Veuillez entrer un code');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/codes/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          formule_id: params.id,
          ip: 'client-ip'
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Code valide! Accès accordé');
        setMessageType('success');
        setUnlocked(true);
        setCode('');
        
        // Enregistrer dans l'historique
        await fetch('/api/historique', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: code.trim(),
            formule_id: params.id
          })
        });
      } else {
        setMessage('❌ Code invalide ou déjà utilisé');
        setMessageType('error');
        setCode('');
      }
    } catch (error) {
      setMessage('❌ Erreur lors de la vérification');
      setMessageType('error');
    }

    setLoading(false);
  };

  if (!formule) return <div className="text-center py-20 text-slate-400">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="bg-slate-700 hover:bg-slate-600 w-10 h-10 rounded-full flex items-center justify-center text-xl transition">
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{formule.nom}</h1>
            <p className="text-slate-400 text-sm">{formule.description}</p>
          </div>
        </div>

        {!unlocked ? (
          <>
            {/* CONTENU VERROUILLÉ */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
              <div className="text-7xl mb-6">🔒</div>
              <h2 className="text-2xl font-bold mb-4">Contenu verrouillé</h2>
              <p className="text-slate-400 mb-8">
                Pour accéder à ce contenu, entrez un code Paysafecard valide
              </p>

              {message && (
                <div className={`mb-6 p-4 rounded-lg text-sm font-semibold ${
                  messageType === 'success' 
                    ? 'bg-green-900 text-green-300 border border-green-700' 
                    : 'bg-red-900 text-red-300 border border-red-700'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="XXXX XXXX XXXX XXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength="20"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-4 text-center text-white placeholder-slate-500 focus:border-red-500 outline-none font-mono text-lg tracking-widest"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-3 rounded-lg transition"
                >
                  {loading ? 'Vérification...' : 'Déverrouiller'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            {/* CONTENU DÉVERROUILLÉ */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Accès accordé!</h2>
              <p className="text-slate-400 mb-8">
                Vous avez accès illimité à ce contenu
              </p>

              {/* Contenu (exemple) */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-slate-700 rounded-lg aspect-video flex items-center justify-center text-3xl">
                    📸
                  </div>
                ))}
              </div>

              <Link
                href="/"
                className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                ← Retour aux formules
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
