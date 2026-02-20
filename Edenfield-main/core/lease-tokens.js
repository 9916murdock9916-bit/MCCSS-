import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';

const SECRET_FILE = path.resolve(process.cwd(), 'lease_secret');

async function getSecret() {
  // Prefer env var for production safety
  if (process.env.LEASE_SIGNING_SECRET) return process.env.LEASE_SIGNING_SECRET;
  try {
    const s = await fs.readFile(SECRET_FILE, 'utf8');
    return s.trim();
  } catch (e) {
    const generated = (Math.random().toString(36) + Date.now().toString(36)).slice(2);
    await fs.writeFile(SECRET_FILE, generated, 'utf8');
    return generated;
  }
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
