#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { LeaseManager } from '../core/leases.js';

const argv = process.argv.slice(2);

function help() {
  console.log(`edenfield CLI
Usage:
  edenfield install         - initialize local artifacts
  edenfield lease create <ownerId> <organismId> - create a lease
  edenfield lease list <ownerId> - list leases for owner
  edenfield version         - show package version
`);
}

async function main() {
  const cmd = argv[0];
  try {
    if (!cmd || cmd === 'help') return help();

    if (cmd === 'install') {
      await LeaseManager.init();
      console.log('edenfield: initialized local artifacts (leases)');
      return;
    }

    if (cmd === 'version') {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
      console.log(pkg.version);
      return;
    }

    if (cmd === 'lease') {
      const sub = argv[1];
      if (sub === 'create') {
        const ownerId = argv[2];
        const organismId = argv[3];
        if (!ownerId || !organismId) return console.error('usage: edenfield lease create <ownerId> <organismId>');
        await LeaseManager.createLease({ ownerId, organismId });
        console.log('lease created');
        return;
      }

      if (sub === 'list') {
        const ownerId = argv[2];
        if (!ownerId) return console.error('usage: edenfield lease list <ownerId>');
        const ls = LeaseManager.getLeasesByOwner(ownerId);
        console.log(JSON.stringify(ls, null, 2));
        return;
      }
    }

    help();
  } catch (err) {
    console.error('edenfield error:', err.message || err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;
