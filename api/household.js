// api/household.js
// Creates and verifies household codes stored in Vercel KV.
// POST /api/household  { action: 'create' }          → { code: 'FLUX-8724' }
// POST /api/household  { action: 'verify', code: 'FLUX-8724' } → { exists: true }

const KV_URL   = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kvGet(key) {
  const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` }
  });
  const j = await r.json();
  if (!j.result) return null;
  try { return JSON.parse(j.result); } catch { return j.result; }
}

async function kvSet(key, value) {
  await fetch(KV_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', key, JSON.stringify(value)])
  });
}

// Avoids visually confusing characters: no I, O, 0, 1
function makeCode() {
  const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digit = '23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += alpha[Math.floor(Math.random() * alpha.length)];
  code += '-';
  for (let i = 0; i < 4; i++) code += digit[Math.floor(Math.random() * digit.length)];
  return code;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, code: inputCode } = req.body || {};

  if (action === 'create') {
    // Generate a unique code (retry up to 10 times on collision — rare at this scale)
    let code;
    for (let i = 0; i < 10; i++) {
      code = makeCode();
      if (!(await kvGet(`hh:${code}`))) break;
    }
    await kvSet(`hh:${code}`, { code, created: Date.now(), users: {} });
    return res.json({ code });
  }

  if (action === 'verify') {
    const code = (inputCode || '').toUpperCase().trim();
    if (!code) return res.status(400).json({ error: 'Missing code' });
    const hh = await kvGet(`hh:${code}`);
    return res.json({ exists: !!hh });
  }

  return res.status(400).json({ error: 'Unknown action. Use create or verify.' });
}
