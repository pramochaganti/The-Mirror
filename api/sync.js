// api/sync.js
// Push and pull user data for a household (keyed by family code).
// GET  /api/sync?code=FLUX-8724              → { users: { ... } }
// POST /api/sync  { code, users: { ... } }   → { ok: true }
//
// Data model: one household document per code. `users` is a map of
// uid (e.g. "kid:priya") → complete user state object.
// Last-write-wins per user slot — kid and parent write separate slots
// so there are no conflicts between devices.

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const code = (req.query.code || '').toUpperCase().trim();
    if (!code) return res.status(400).json({ error: 'Missing code' });
    const hh = await kvGet(`hh:${code}`);
    if (!hh) return res.status(404).json({ error: 'Household not found. Check the family code.' });
    return res.json({ users: hh.users || {} });
  }

  if (req.method === 'POST') {
    const { code, users } = req.body || {};
    if (!code || !users) return res.status(400).json({ error: 'Missing code or users' });
    const key = code.toUpperCase().trim();
    const hh  = await kvGet(`hh:${key}`);
    if (!hh) return res.status(404).json({ error: 'Household not found. Check the family code.' });
    // Merge: preserve any users not present in this push (other device's data)
    hh.users   = { ...hh.users, ...users };
    hh.updated = Date.now();
    await kvSet(`hh:${key}`, hh);
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
