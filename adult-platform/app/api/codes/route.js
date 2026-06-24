// app/api/codes/[id]/route.js

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

// DELETE /api/codes/[id] - Supprimer un code
export async function DELETE(req, { params }) {
  const id = parseInt(params.id);
  const data = await getData();

  if (!data.codes) data.codes = [];
  
  data.codes = data.codes.filter(c => c.id !== id);
  await saveData(data);

  return Response.json({ success: true, message: 'Code supprimé' });
}
