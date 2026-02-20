#!/usr/bin/env node
/*
  Safe build watcher with debounce and simple rate-limiting.

  Behavior:
  - Watches repo files and runs `npm run build` when changes are detected.
  - Debounces frequent changes (default 500ms).
  - Limits remote-triggered builds unless `BUILD_TRIGGER_ENABLED=true` and token provided.
  - Enforces a minimum interval between builds (configured by `BUILD_MIN_INTERVAL_MS`, default 60s).
  - Tracks build counts and enforces a simple hourly cap to prevent runaway loops.
*/

import { spawn } from 'child_process';
import chokidar from 'chokidar';
import http from 'http';

const WATCH_PATHS = [
  'core/**',
  '*.js',
  'app.js',
  'index.html'
];

const DEBOUNCE_MS = Number(process.env.BUILD_DEBOUNCE_MS || 500);
const BUILD_MIN_INTERVAL_MS = Number(process.env.BUILD_MIN_INTERVAL_MS || 60_000);
const HOURLY_CAP = Number(process.env.BUILD_HOURLY_CAP || 60);
const REMOTE_TRIGGER_ENABLED = String(process.env.BUILD_TRIGGER_ENABLED || 'false') === 'true';
const REMOTE_TOKEN = process.env.BUILD_TRIGGER_TOKEN || '';
const REMOTE_PORT = Number(process.env.BUILD_TRIGGER_PORT || 9123);

let lastBuildTs = 0;
let hourlyCount = 0;
let hourWindowStart = Date.now();
let debounceTimer = null;
let running = false;

function shouldBuild() {
  const now = Date.now();
  if (now - lastBuildTs < BUILD_MIN_INTERVAL_MS) return false;
  if (now - hourWindowStart > 3600_000) {
    hourWindowStart = now;
    hourlyCount = 0;
  }
  if (hourlyCount >= HOURLY_CAP) return false;
  return true;
}

function runBuild() {
  if (running) return;
  if (!shouldBuild()) {
    console.log('build skipped due to rate limits/min-interval');
    return;
  }

  running = true;
  lastBuildTs = Date.now();
  hourlyCount += 1;

  console.log('Running build...');
  const p = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { stdio: 'inherit' });
  p.on('close', (code) => {
    running = false;
    console.log('Build finished with code', code);
  });
}

function touchBuild() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runBuild, DEBOUNCE_MS);
}

// File watcher
const watcher = chokidar.watch(WATCH_PATHS, { ignoreInitial: true, persistent: true });
watcher.on('all', (event, path) => {
  console.log('watch event', event, path);
  touchBuild();
});

console.log('Watch-build started. Watching paths:', WATCH_PATHS.join(', '));

// Optional remote trigger endpoint (guarded)
if (REMOTE_TRIGGER_ENABLED) {
  const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/trigger') {
      const token = req.headers['x-build-token'] || req.headers['authorization'] || '';
      if (!token || String(token) !== REMOTE_TOKEN) {
        res.statusCode = 403;
        res.end('forbidden');
        return;
      }

      if (!shouldBuild()) {
        res.statusCode = 429;
        res.end('rate-limited');
        return;
      }

      touchBuild();
      res.statusCode = 202;
      res.end('accepted');
      return;
    }

    res.statusCode = 404;
    res.end('not found');
  });

  server.listen(REMOTE_PORT, () => {
    console.log(`Remote build trigger enabled on port ${REMOTE_PORT} (token required)`);
  });
}

// graceful shutdown
process.on('SIGINT', () => { watcher.close(); process.exit(0); });
process.on('SIGTERM', () => { watcher.close(); process.exit(0); });
