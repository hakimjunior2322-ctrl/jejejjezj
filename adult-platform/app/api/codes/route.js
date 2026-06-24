// app/api/codes/route.js

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

// GET /api/codes - Récupérer tous les codes
export async function GET() {
  const data = await getData();
  const codes = (data.codes || []).map(c => ({
    ...c,
    formule: (data.formules || []).find(f => f.id === c.formule_id)
  }));
  return Response.json(codes);
}

// POST /api/codes - Ajouter un code Paysafecard
export async function POST(req) {
  const body = await req.json();
  const data = await getData();

  const newCode = {
    id: Date.now(),
    formule_id: body.formule_id,
    code_value: body.code_value.toUpperCase(),
    status: 'active',
    created_at: new Date().toISOString()
  };

  if (!data.codes) data.codes = [];
  
  // Vérifier que le code n'existe pas déjà
  if (data.codes.find(c => c.code_value === newCode.code_value)) {
    return Response.json({ error: 'Code déjà existant' }, { status: 400 });
  }

  data.codes.push(newCode);
  await saveData(data);

  return Response.json(newCode, { status: 201 });
}
