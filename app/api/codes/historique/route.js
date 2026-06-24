// app/api/historique/route.js

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const dbFile = join(process.cwd(), 'data.json');

async function getData() {
  try {
    const data = await readFile(dbFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { formules: [], codes: [], historique: [] };
  }
}

async function saveData(data) {
  await writeFile(dbFile, JSON.stringify(data, null, 2));
}

// GET /api/historique - Récupérer l'historique des codes utilisés
export async function GET() {
  const data = await getData();
  
  const historique = (data.historique || []).map(h => ({
    ...h,
    formule: (data.formules || []).find(f => f.id === h.formule_id)
  }));

  // Trier par date décroissante (plus récents en premier)
  historique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return Response.json(historique);
}

// POST /api/historique - Enregistrer manuellement un code utilisé (optionnel)
export async function POST(req) {
  const { code, formule_id } = await req.json();
  const data = await getData();

  if (!data.historique) data.historique = [];

  const entry = {
    id: Date.now(),
    code_value: code.toUpperCase(),
    formule_id: parseInt(formule_id),
    user_ip: req.headers.get('x-forwarded-for') || 'unknown',
    created_at: new Date().toISOString()
  };

  data.historique.push(entry);
  await saveData(data);

  return Response.json(entry, { status: 201 });
}
