import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { Audit } from './audit.js';

const LEASES_FILE = path.resolve(process.cwd(), 'leases.json');

export const LeaseManager = {
  leases: [],

  // Synchronous initializer to allow permission checks to be synchronous.
  initSync() {
    try {
      if (fs.existsSync(LEASES_FILE)) {
        const raw = fs.readFileSync(LEASES_FILE, 'utf8');
        this.leases = JSON.parse(raw || '[]');
      } else {
        this.leases = [];
        // ensure file exists
        fs.writeFileSync(LEASES_FILE, JSON.stringify(this.leases, null, 2), 'utf8');
      }
    } catch (e) {
      this.leases = [];
      try { fs.writeFileSync(LEASES_FILE, JSON.stringify(this.leases, null, 2), 'utf8'); } catch (_) {}
    }
  },

  async init() {
    // async initializer for code paths that prefer promises
    try {
      const raw = await fsp.readFile(LEASES_FILE, 'utf8');
      this.leases = JSON.parse(raw || '[]');
    } catch (e) {
      this.leases = [];
      await this.save();
    }
  },

  async save() {
    await fsp.writeFile(LEASES_FILE, JSON.stringify(this.leases, null, 2), 'utf8');
  },

  async createLease({ ownerId, organismId, expires = null }) {
    if (!ownerId || !organismId) throw new Error('ownerId and organismId required');
    await this.init();
    const id = `${ownerId}:${organismId}:${Date.now()}`;
    const lease = { id, ownerId, organismId, createdAt: new Date().toISOString(), expires };
    this.leases.push(lease);
    await this.save();
    Audit.log('lease.create', { leaseId: id, ownerId, organismId });
    return lease;
  },

  async revokeLease(id) {
    await this.init();
    const before = this.leases.length;
    this.leases = this.leases.filter(l => l.id !== id);
    if (this.leases.length !== before) {
      await this.save();
      Audit.log('lease.revoke', { leaseId: id });
      return true;
    }
    return false;
  },

  getLeasesByOwner(ownerId) {
    return (this.leases || []).filter(l => l.ownerId === ownerId);
  },

  isOwnerOf(ownerId, organismId) {
    return (this.leases || []).some(l => l.ownerId === ownerId && l.organismId === organismId && (!l.expires || new Date(l.expires) > new Date()));
  },

  // synchronous owner check that does not touch disk; requires `initSync()` run at startup
  isOwnerOfSync(ownerId, organismId) {
    return (this.leases || []).some(l => l.ownerId === ownerId && l.organismId === organismId && (!l.expires || new Date(l.expires) > new Date()));
  },

  getAll() {
    return this.leases;
  }
};
