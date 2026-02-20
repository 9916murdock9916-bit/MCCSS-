#!/usr/bin/env node
/*
  Minimal admin HTTP server for managing leases and viewing audit logs.
  - Protect with `ADMIN_API_TOKEN` env var (required)
  - Bind address and port controllable via `ADMIN_BIND` and `ADMIN_PORT`
*/

import http from 'http';
import { LeaseManager } from '../core/leases.js';
import { Audit } from '../core/audit.js';
import { LeaseTokens } from '../core/lease-tokens.js';
import url from 'url';

const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN || '';
if (!ADMIN_TOKEN) {
  console.error('ADMIN_API_TOKEN not set. Exiting.');
  process.exit(1);
}

const PORT = Number(process.env.ADMIN_PORT || 9321);

// ensure leases are loaded into memory for sync checks
try { LeaseManager.initSync && LeaseManager.initSync(); } catch (e) { /* best-effort */ }

function requireAuth(req, res) {
  const token = req.headers['x-admin-token'] || '';
  if (!token || token !== ADMIN_TOKEN) {
    res.writeHead(403, { 'content-type': 'text/plain' });
    res.end('forbidden');
    return false;
  }
  return true;
}

async function bodyJson(req) {
  return new Promise((resolve, reject) => {
    let s = '';
    req.on('data', (c) => s += c);
    req.on('end', () => {
      try { resolve(JSON.parse(s || '{}')); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  if (!requireAuth(req, res)) return;

  try {
    if (req.method === 'GET' && parsed.pathname === '/leases') {
      const ownerId = parsed.query.ownerId || null;
      const data = ownerId ? LeaseManager.getLeasesByOwner(ownerId) : LeaseManager.getAll();
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    if (req.method === 'POST' && parsed.pathname === '/leases') {
      const body = await bodyJson(req);
      const lease = await LeaseManager.createLease(body);
      res.writeHead(201, { 'content-type': 'application/json' });
      res.end(JSON.stringify(lease));
      return;
    }

    if (req.method === 'POST' && parsed.pathname.startsWith('/leases/') && parsed.pathname.endsWith('/revoke')) {
      const id = parsed.pathname.split('/')[2];
      const ok = await LeaseManager.revokeLease(id);
      res.writeHead(ok ? 200 : 404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok }));
      return;
    }

    if (req.method === 'POST' && parsed.pathname.startsWith('/leases/') && parsed.pathname.endsWith('/token')) {
      const id = parsed.pathname.split('/')[2];
      await LeaseManager.init();
      const lease = LeaseManager.getAll().find(l => l.id === id);
      if (!lease) { res.writeHead(404); res.end('not found'); return; }
      const token = await LeaseTokens.signLease(lease);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ token }));
      return;
    }

    if (req.method === 'GET' && parsed.pathname === '/audit') {
      // stream last N lines of audit.log
      try {
        const data = await AuditReadLines(200);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (e) {
        res.writeHead(500); res.end('error');
      }
      return;
    }

    res.writeHead(404); res.end('not found');
  } catch (e) {
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end('server error');
  }
});

async function AuditReadLines(n = 100) {
  // best-effort read of audit.log (last n lines)
  const fs = await import('fs/promises');
  const path = await import('path');
  const p = path.resolve(process.cwd(), 'audit.log');
  try {
    const buf = await fs.readFile(p, 'utf8');
    const lines = buf.trim().split('\n');
    return lines.slice(-n).map(l => JSON.parse(l));
  } catch (e) {
    return [];
  }
}

server.listen(PORT, () => console.log(`admin-server listening on ${PORT}`));
