#!/usr/bin/env node
import fs from 'fs';
import https from 'https';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import expressPino from 'pino-http';
import { LeaseManager } from '../core/leases.js';
import { Audit } from '../core/audit.js';
import { LeaseTokens } from '../core/lease-tokens.js';
import { LeaseTokens as LT } from '../core/lease-tokens.js';
import promClient from 'prom-client';
import jwksRsa from 'jwks-rsa';
import jwt from 'jsonwebtoken';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(expressPino({ logger }));

// metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: Number(process.env.ADMIN_RATE_LIMIT || 120) });
app.use(limiter);

// ensure leases loaded
try { LeaseManager.initSync && LeaseManager.initSync(); } catch (e) { logger.warn('lease initSync failed'); }

// simple auth: either static admin token or OIDC bearer
const OIDC_JWKS_URI = process.env.OIDC_JWKS_URI || '';
let jwksClient = null;
if (OIDC_JWKS_URI) jwksClient = jwksRsa({ jwksUri: OIDC_JWKS_URI });

async function authMiddleware(req, res, next) {
  // prefer Bearer token
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    if (jwksClient) {
      try {
        const decodedHeader = jwt.decode(token, { complete: true });
        const kid = decodedHeader && decodedHeader.header && decodedHeader.header.kid;
        const key = await jwksClient.getSigningKeyAsync(kid);
        const pub = key.getPublicKey();
        jwt.verify(token, pub);
        return next();
      } catch (e) {
        return res.status(403).send('forbidden');
      }
    }
    // fallback to local lease token verification
    const resv = await LT.verify(token);
    if (resv.valid) return next();
    return res.status(403).send('forbidden');
  }

  // fallback to static admin token header
  const x = req.headers['x-admin-token'] || '';
  const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN || '';
  if (ADMIN_TOKEN && x && x === ADMIN_TOKEN) return next();
  return res.status(403).send('forbidden');
}

app.use(authMiddleware);

app.get('/leases', (req, res) => {
  const ownerId = req.query.ownerId || null;
  const data = ownerId ? LeaseManager.getLeasesByOwner(ownerId) : LeaseManager.getAll();
  res.json(data);
});

app.post('/leases', async (req, res) => {
  const lease = await LeaseManager.createLease(req.body);
  res.status(201).json(lease);
});

app.post('/leases/:id/revoke', async (req, res) => {
  const id = req.params.id;
  const ok = await LeaseManager.revokeLease(id);
  res.status(ok ? 200 : 404).json({ ok });
});

app.post('/leases/:id/token', async (req, res) => {
  const id = req.params.id;
  await LeaseManager.init();
  const lease = LeaseManager.getAll().find(l => l.id === id);
  if (!lease) return res.status(404).send('not found');
  const token = await LeaseTokens.signLease(lease);
  res.json({ token });
});

app.get('/audit', async (req, res) => {
  const lines = await AuditReadLines(200);
  res.json(lines);
});

async function AuditReadLines(n = 100) {
  try {
    const buf = await import('fs/promises').then(m => m.readFile('./audit.log', 'utf8'));
    const lines = buf.trim().split('\n');
    return lines.slice(-n).map(l => JSON.parse(l));
  } catch (e) { return []; }
}

const PORT = Number(process.env.ADMIN_PORT || 9321);

// TLS / mTLS configuration
const TLS_KEY = process.env.ADMIN_TLS_KEY || '';
const TLS_CERT = process.env.ADMIN_TLS_CERT || '';
const REQUIRE_CLIENT_CERT = String(process.env.ADMIN_MTLS || 'false') === 'true';

export function startServer() {
  if (TLS_KEY && TLS_CERT) {
    const key = fs.readFileSync(TLS_KEY);
    const cert = fs.readFileSync(TLS_CERT);
    const options = { key, cert };
    if (REQUIRE_CLIENT_CERT) {
      options.requestCert = true;
      options.rejectUnauthorized = true;
    }
    https.createServer(options, app).listen(PORT, () => logger.info(`admin-server (https) listening on ${PORT}`));
  } else {
    app.listen(PORT, () => logger.info(`admin-server (http) listening on ${PORT}`));
  }
}

// Auto-start unless running under tests
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
