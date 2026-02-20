import fs from 'fs/promises';
import path from 'path';

const LEASES_FILE = path.resolve(process.cwd(), 'leases.json');

export const LeaseManager = {
  leases: [],

  async init() {
    try {
      const raw = await fs.readFile(LEASES_FILE, 'utf8');
      this.leases = JSON.parse(raw || '[]');
    } catch (e) {
      this.leases = [];
      await this.save();
    }
  },

  async save() {
    await fs.writeFile(LEASES_FILE, JSON.stringify(this.leases, null, 2), 'utf8');
  },

  async createLease({ ownerId, organismId, expires = null }) {
    if (!ownerId || !organismId) throw new Error('ownerId and organismId required');
    await this.init();
    const id = `${ownerId}:${organismId}:${Date.now()}`;
    const lease = { id, ownerId, organismId, createdAt: new Date().toISOString(), expires };
    this.leases.push(lease);
    await this.save();
    return lease;
  },

  getLeasesByOwner(ownerId) {
    return (this.leases || []).filter(l => l.ownerId === ownerId);
  },

  isOwnerOf(ownerId, organismId) {
    return (this.leases || []).some(l => l.ownerId === ownerId && l.organismId === organismId && (!l.expires || new Date(l.expires) > new Date()));
  },

  getAll() {
    return this.leases;
  }
};
