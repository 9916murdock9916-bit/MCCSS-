#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { Audit } from '../Edenfield-main/core/audit.js';

const SECRET_FILE = path.resolve(process.cwd(), 'Edenfield-main', 'lease_secret');

async function rotate() {
  const generated = (Math.random().toString(36) + Date.now().toString(36)).slice(2);
  await fs.writeFile(SECRET_FILE, generated, 'utf8');
  await Audit.log('lease_secret.rotate', { file: SECRET_FILE });
  console.log('rotated lease secret');
}

rotate().catch(e => { console.error('rotate failed', e); process.exit(1); });
