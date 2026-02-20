#!/usr/bin/env node
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('Preparing release artifact (npm pack)...');
  const p = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['pack'], { stdio: 'inherit', cwd: path.resolve(process.cwd(), 'Edenfield-main') });
  p.on('close', async (code) => {
    if (code !== 0) {
      console.error('npm pack failed with code', code);
      process.exit(code);
      return;
    }

    try {
      const fname = (await fs.readdir(path.resolve(process.cwd(), 'Edenfield-main'))).find(f => f.endsWith('.tgz'));
      if (fname) {
        console.log('Packed artifact:', fname);
        await fs.writeFile(path.resolve(process.cwd(), 'RELEASE_NOTE.txt'), `Artifact: ${fname}\nGenerated: ${new Date().toISOString()}\n`, 'utf8');
        console.log('Wrote RELEASE_NOTE.txt');
      }
    } catch (e) {
      console.error('release helper error', e && e.message);
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) main();
