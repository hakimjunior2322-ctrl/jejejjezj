'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [formules, setFormules] = useState([]);
  const [ageVerified, setAgeVerified] = useState(false);

  useEffect(() => {
    // Vérifier le cookie d'âge
    const ageCheck = localStorage.getItem('age_verified');
    if (ageCheck) setAgeVerified(true);
    
    // Charger les formules
    loadFormules();
  }, []);

  const loadFormules = async () => {
    try {
      const res = await fetch('/api/formules');
      const data = await res.json();
      setFormules(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleAgeVerify = (day, month, year) => {
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age >= 18) {
      localStorage.setItem('age_verified', 'true');
      setAgeVerified(true);
    } else {
      alert('Vous devez avoir 18 ans ou plus');
    }
  };

  if (!ageVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-6">🔞</div>
          <h2 className="text-2xl font-bold mb-2">Vérification d'âge</h2>
          <p className="text-slate-400 mb-8">Ce site est réservé aux personnes de 18 ans et plus</p>
          
          <AgeForm onVerify={handleAgeVerify} />
          
          <p className="text-slate-500 text-xs mt-6">
            En continuant, vous confirmez que vous avez au moins 18 ans
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Admin */}
      <div className="p-4 flex justify-between items-center border-b border-slate-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
          🔥 ADULT PLATFORM
        </h1>
        <Link href="/admin" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-semibold transition">
          🛡️ Admin
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-block bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
            ● EN LIVE
          </div>
          <h1 className="text-5xl font-bold mb-2">Choisis ta formule</h1>
          <p className="text-red-400 text-xl">De quoi as-tu envie ?</p>
        </div>

        {/* Grille Formules */}
        <div className="grid gap-4 mb-12">
          {formules.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Aucune formule disponible
            </div>
          ) : (
            formules.map((formule) => (
              <Link
                key={formule.id}
                href={`/locked/${formule.id}`}
                className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-red-500 hover:bg-slate-700 transition group flex items-center gap-4"
              >
                <div className="text-4xl">{formule.emoji}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold group-hover:text-red-400 transition">{formule.nom}</h3>
                  <p className="text-slate-400 text-sm">{formule.description}</p>
                </div>
                <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm">
                  {formule.codes_alloues} codes
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="text-center text-slate-500 text-xs border-t border-slate-700 pt-8">
          Service à valeur ajoutée · Réservé aux +18 ans
        </div>
      </div>
    </div>
  );
}

function AgeForm({ onVerify }) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (day && month && year) {
      onVerify(parseInt(day), parseInt(month), parseInt(year));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <input
          type="number"
          placeholder="JJ"
          min="1"
          max="31"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-center text-white placeholder-slate-500 focus:border-red-500 outline-none"
        />
        <input
          type="number"
          placeholder="MM"
          min="1"
          max="12"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-center text-white placeholder-slate-500 focus:border-red-500 outline-none"
        />
        <input
          type="number"
          placeholder="AAAA"
          min="1900"
          max="2006"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg p-3 text-center text-white placeholder-slate-500 focus:border-red-500 outline-none"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-lg transition"
      >
        Confirmer
      </button>
    </form>
  );
}
