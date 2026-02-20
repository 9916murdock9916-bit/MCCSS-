import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import fssync from 'fs';
import path from 'path';

// Flexible secret file resolution: prefer explicit env path, then project-level file, then repo root.
const DEFAULT_SECRET_PATHS = [
  () => process.env.LEASE_SECRET_PATH,
  () => path.resolve(process.cwd(), 'Edenfield-main', 'lease_secret'),
  () => path.resolve(process.cwd(), 'lease_secret')
];

async function getSecret() {
  // Prefer direct secret value for production safety
  if (process.env.LEASE_SIGNING_SECRET) return process.env.LEASE_SIGNING_SECRET;

  for (const pfn of DEFAULT_SECRET_PATHS) {
    const p = pfn();
    if (!p) continue;
    try {
      const s = await fs.readFile(p, 'utf8');
      return s.trim();
    } catch (e) {
      // try next
    }
  }

  // generate into project-level file
  const target = path.resolve(process.cwd(), 'Edenfield-main', 'lease_secret');
  const generated = (Math.random().toString(36) + Date.now().toString(36)).slice(2);
  try { await fs.writeFile(target, generated, 'utf8'); } catch (e) { /* best-effort */ }
  return generated;
}

export const LeaseTokens = {
  async signLease(lease, opts = {}) {
    const secret = await getSecret();
    const payload = {
      leaseId: lease.id,
      ownerId: lease.ownerId,
      organismId: lease.organismId,
      iat: Math.floor(Date.now() / 1000)
    };
    if (lease.expires) payload.exp = Math.floor(new Date(lease.expires).getTime() / 1000);
    if (opts.extra) Object.assign(payload, opts.extra);
    return jwt.sign(payload, secret, { algorithm: 'HS256' });
  },

  async verify(token) {
    const secret = await getSecret();
    try {
      const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
      return { valid: true, payload: decoded };
    } catch (e) {
      return { valid: false, error: e.message };
    }
  }
};
