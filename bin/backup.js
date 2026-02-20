#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const srcDir = path.resolve(process.cwd(), 'Edenfield-main');
const backups = path.resolve(process.cwd(), 'backups');

async function run() {
  await fs.mkdir(backups, { recursive: true });
  const ts = Date.now();
  try {
    await fs.copyFile(path.join(srcDir, 'leases.json'), path.join(backups, `leases-${ts}.json`));
  } catch (e) {}
  try {
    await fs.copyFile(path.join(srcDir, 'audit.log'), path.join(backups, `audit-${ts}.log`));
  } catch (e) {}
  console.log('backup complete');
}

run().catch(e => { console.error('backup failed', e); process.exit(1); });
