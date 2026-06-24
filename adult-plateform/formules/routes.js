// app/api/formules/route.js

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

// GET /api/formules - Récupérer toutes les formules
export async function GET() {
  const data = await getData();
  return Response.json(data.formules || []);
}

// POST /api/formules - Créer une formule
export async function POST(req) {
  const body = await req.json();
  const data = await getData();

  const newFormule = {
    id: Date.now(),
    nom: body.nom,
    description: body.description,
    emoji: body.emoji || '📋',
    codes_alloues: body.codes_alloues,
    created_at: new Date().toISOString()
  };

  if (!data.formules) data.formules = [];
  data.formules.push(newFormule);
  await saveData(data);

  return Response.json(newFormule, { status: 201 });
}
