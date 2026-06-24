// app/api/formules/[id]/route.js

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

// DELETE /api/formules/[id] - Supprimer une formule
export async function DELETE(req, { params }) {
  const id = parseInt(params.id);
  const data = await getData();

  if (!data.formules) data.formules = [];
  
  data.formules = data.formules.filter(f => f.id !== id);
  await saveData(data);

  return Response.json({ success: true, message: 'Formule supprimée' });
}

// GET /api/formules/[id] - Récupérer une formule spécifique
export async function GET(req, { params }) {
  const id = parseInt(params.id);
  const data = await getData();

  const formule = (data.formules || []).find(f => f.id === id);
  
  if (!formule) {
    return Response.json({ error: 'Formule non trouvée' }, { status: 404 });
  }

  return Response.json(formule);
}
