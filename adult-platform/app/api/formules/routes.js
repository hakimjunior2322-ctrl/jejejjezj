 app/api/formules/route.js
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

// GET /api/formules
export async function GET(req) {
  const data = await getData();
  return Response.json(data.formules || []);
}

// POST /api/formules
export async function POST(req) {
  const body = await req.json();
  const data = await getData();

  const newFormule = {
    id: Date.now(),
    ...body,
    created_at: new Date()
  };

  if (!data.formules) data.formules = [];
  data.formules.push(newFormule);
  await saveData(data);

  return Response.json(newFormule, { status: 201 });
}

// app/api/formules/[id]/route.js
export async function DELETE(req, { params }) {
  const data = await getData();
  const id = parseInt(params.id || req.nextUrl.pathname.split('/').pop());

  if (!data.formules) data.formules = [];
  data.formules = data.formules.filter(f => f.id !== id);
  await saveData(data);

  return Response.json({ success: true });
}

// ---

// app/api/codes/verify/route.js
export async function POST_VERIFY(req) {
  const { code, formule_id, ip } = await req.json();
  const data = await getData();

  if (!data.codes) data.codes = [];

  // Trouver le code
  const codeObj = data.codes.find(c =>
    c.code_value === code &&
    c.formule_id === parseInt(formule_id) &&
    c.status === 'active'
  );

  if (!codeObj) {
    return Response.json({ error: 'Code invalide' }, { status: 400 });
  }

  // Marquer comme utilisé
  codeObj.status = 'used';
  codeObj.used_at = new Date();
  codeObj.used_by_ip = ip;

  // Enregistrer dans l'historique
  if (!data.historique) data.historique = [];
  data.historique.push({
    code_value: code,
    formule_id: parseInt(formule_id),
    user_ip: ip,
    created_at: new Date()
  });

  await saveData(data);

  return Response.json({ success: true, message: 'Code valide' });
}

// app/api/codes/route.js
export async function GET_CODES(req) {
  const data = await getData();
  const codes = (data.codes || []).map(c => ({
    ...c,
    formule: (data.formules || []).find(f => f.id === c.formule_id)
  }));
  return Response.json(codes);
}

export async function POST_CODES(req) {
  const body = await req.json();
  const data = await getData();

  const newCode = {
    id: Date.now(),
    ...body,
    status: 'active',
    created_at: new Date()
  };

  if (!data.codes) data.codes = [];
  data.codes.push(newCode);
  await saveData(data);

  return Response.json(newCode, { status: 201 });
}

// app/api/codes/[id]/route.js
export async function DELETE_CODE(req, { params }) {
  const data = await getData();
  const id = parseInt(params.id || req.nextUrl.pathname.split('/').pop());

  if (!data.codes) data.codes = [];
  data.codes = data.codes.filter(c => c.id !== id);
  await saveData(data);

  return Response.json({ success: true });
}

// app/api/historique/route.js
export async function GET_HISTORIQUE(req) {
  const data = await getData();
  const historique = (data.historique || []).map(h => ({
    ...h,
    formule: (data.formules || []).find(f => f.id === h.formule_id)
  }));
  return Response.json(historique.reverse());
}

export async function POST_HISTORIQUE(req) {
  const { code, formule_id } = await req.json();
  const data = await getData();

  if (!data.historique) data.historique = [];

  data.historique.push({
    code_value: code,
    formule_id: parseInt(formule_id),
    user_ip: req.headers.get('x-forwarded-for') || 'unknown',
    created_at: new Date()
  });

  await saveData(data);
  return Response.json({ success: true }, { status: 201 });
}
