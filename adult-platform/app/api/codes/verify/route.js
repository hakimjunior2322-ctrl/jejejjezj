// app/api/codes/verify/route.js

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

// POST /api/codes/verify - Vérifier un code
export async function POST(req) {
  const { code, formule_id } = await req.json();
  const data = await getData();

  if (!data.codes) data.codes = [];

  // Trouver le code EXACTEMENT
  const codeObj = data.codes.find(c =>
    c.code_value === code.toUpperCase() &&
    c.formule_id === parseInt(formule_id) &&
    c.status === 'active'
  );

  if (!codeObj) {
    return Response.json(
      { error: 'Code invalide ou déjà utilisé' },
      { status: 400 }
    );
  }

  // Marquer le code comme utilisé
  codeObj.status = 'used';
  codeObj.used_at = new Date().toISOString();

  // Enregistrer dans l'historique
  if (!data.historique) data.historique = [];
  data.historique.push({
    id: Date.now(),
    code_value: code.toUpperCase(),
    formule_id: parseInt(formule_id),
    user_ip: req.headers.get('x-forwarded-for') || 'unknown',
    created_at: new Date().toISOString()
  });

  await saveData(data);

  return Response.json({
    success: true,
    message: 'Code valide! Accès accordé',
    formule_id: formule_id
  });
}
