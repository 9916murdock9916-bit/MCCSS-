import fs from 'fs/promises';
import path from 'path';

const AUDIT_FILE = path.resolve(process.cwd(), 'audit.log');

export const Audit = {
  async log(eventType, details = {}) {
    const entry = {
      ts: new Date().toISOString(),
      event: eventType,
      details
    };
    try {
      await fs.appendFile(AUDIT_FILE, JSON.stringify(entry) + '\n', 'utf8');
    } catch (e) {
      // best-effort: swallow errors but print so operator can see
      // eslint-disable-next-line no-console
      console.error('Audit write failed', e && e.message);
    }
  }
};
