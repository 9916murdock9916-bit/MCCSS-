# Deployment Guide

Complete guide for deploying Eden Field to production.

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] ESLint has no errors
- [ ] Security audit completed
- [ ] Performance targets met
- [ ] Documentation reviewed
- [ ] CHANGELOG updated
- [ ] Version bumped in package.json
- [ ] Environment variables documented
- [ ] Backup strategy confirmed
- [ ] Rollback plan prepared

## Environment Setup

### Production Environment Variables

Create `.env.production`:

```env
# API Configuration
NODE_ENV=production
VITE_API_URL=https://api.production.example.com
VITE_SYNC_INTERVAL=30000
VITE_SYNC_BATCH_SIZE=100

# Security
VITE_ENABLE_ENCRYPTION=true
VITE_SECURE_COOKIES=true
VITE_CSP_ENABLED=true

# Monitoring
VITE_SENTRY_DSN=https://your-sentry-key@sentry.io/project
VITE_ANALYTICS_ENABLED=true

# Features
VITE_ENABLE_DEBUG=false
VITE_ENABLE_DEV_TOOLS=false
```

### Staging Environment Variables

Create `.env.staging`:

```env
NODE_ENV=staging
VITE_API_URL=https://api.staging.example.com
VITE_SYNC_INTERVAL=30000
VITE_ENABLE_ENCRYPTION=true
VITE_ENABLE_DEBUG=true
```

## Build Process

### Local Build

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Run linter
npm run lint

# Build for production
npm run build
```

### Continuous Integration

The repository includes GitHub Actions workflows for:
- Code linting on every push
- Test suite execution
- Security scanning
- Automatic deployment on release tags

## Server Hosting

### HTTPS Configuration

**Required**: All production deployments must use HTTPS

```apache
# Apache configuration example
<VirtualHost *:443>
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    DocumentRoot /var/www/edenfield
    
    # Service Worker requires HTTPS
    <FilesMatch "\.js$">
        Header set Cache-Control "public, max-age=3600"
    </FilesMatch>
    
    # HTML files
    <FilesMatch "\.html$">
        Header set Cache-Control "public, max-age=3600, must-revalidate"
    </FilesMatch>
    
    # Service Worker
    <FilesMatch "^service-worker\.js$">
        Header set Cache-Control "public, max-age=0, must-revalidate"
    </FilesMatch>
</VirtualHost>
```

### CORS Configuration

Configure CORS for sync API requests:

```javascript
// Production sync API endpoint should enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://yourdomain.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});
```

### Content Security Policy

Recommended CSP header:

```
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'wasm-unsafe-eval'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  font-src 'self'; 
  connect-src 'self' https://api.example.com wss://sync.example.com; 
  frame-ancestors 'none'; 
  base-uri 'self'; 
  form-action 'self'
```

### Service Worker Setup

The app includes a service worker for offline support:

1. Service worker is automatically registered in `app.js`
2. Must be served from root directory
3. Updates checked: every page load
4. New version activated after user reload

Update strategy:
```javascript
// app.js automatically handles SW updates
// Users are prompted when new version available
navigator.serviceWorker.oncontrollerchange = () => {
  window.location.reload();
};
```

## Database & Sync Backend

### Sync Service Requirements

The production environment requires a backend sync service with:

1. **Endpoint**: `/api/sync`
   - Method: `POST`
   - Authentication: Bearer token
   - Returns: Array of remote changes

2. **Data Format**:
```javascript
// Request
{
  changes: [
    {
      type: "update",
      entity: "document",
      id: "doc-123",
      data: { title: "Updated" }
    }
  ]
}

// Response
{
  result: [
    {
      id: "doc-456",
      type: "create",
      data: { title: "New Document" }
    }
  ]
}
```

3. **Performance Requirements**:
   - Response time: < 500ms
   - Availability: 99.9% uptime
   - Throughput: 1000+ req/sec

## Deployment Strategies

### Blue-Green Deployment

```bash
# Deploy to Blue environment
npm run build
scp -r dist/* blue-server:/var/www/edenfield-blue/

# Test on Blue
curl https://blue.staging.example.com/

# Switch traffic
lb-switch --to blue

# Keep Green as rollback
```

### Rolling Deployment

```bash
# Deploy to servers one at a time
for server in prod-1 prod-2 prod-3; do
  deploy-to-server $server
  wait-for-health-check $server
  add-to-load-balancer $server
done
```

### Canary Deployment

```bash
# Deploy to 5% of servers first
deploy-canary 5%
wait 30min
# Monitor metrics
if metrics_ok; then
  deploy-canary 25%
  wait 30min
fi
if metrics_ok; then
  deploy-all
fi
```

## Monitoring

### Health Checks

```javascript
// Health check endpoint
GET /api/health
Response: { status: "ok", version: "1.0.0", timestamp: "2024-02-20T..." }
```

### Performance Monitoring

Monitor these metrics:
- Page load time (target: < 3s)
- First contentful paint (target: < 1.5s)
- Sync operation duration (target: < 500ms)
- Error rates (target: < 0.1%)

```bash
# Using Lighthouse CI
npm run analyze

# Using New Relic
npm install @newrelic/browser-agent
```

### Error Tracking

```javascript
// Sentry integration
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});
```

### Logging

Log levels:
- `ERROR`: Production errors that require attention
- `WARN`: Unexpected conditions
- `INFO`: Important state changes (login, sync complete)
- `DEBUG`: Detailed diagnostic info (development only)

```javascript
console.error("[ERROR] Sync failed:", error);
console.warn("[WARN] Retry attempt 3/5");
console.info("[INFO] User logged in: user-123");
```

## Scaling

### Horizontal Scaling

Eden Field is stateless and scales horizontally:

1. Deploy identical instances behind load balancer
2. Use shared backend sync service
3. Session data stored client-side (localStorage/IndexedDB)
4. No server-side session affinity needed

### Caching Strategy

- **Static assets** (CDN): Max age 1 year, versioned filenames
- **HTML files**: Max age 1 hour, must-revalidate
- **API responses**: Cache based on content freshness
- **Service Worker**: Force refresh on every page load

### Database Optimization

- Index by entity type and ID
- Archive old sync logs monthly
- Implement retention policies (90 days default)
- Regular vacuum and analyze

## Backup & Recovery

### Backup Strategy

```bash
# Daily incremental backup
0 2 * * * /usr/local/bin/backup-edenfield.sh

# Weekly full backup to cold storage
0 3 * * 0 /usr/local/bin/backup-full-edenfield.sh
```

### Recovery Procedures

1. **Data Loss Recovery**:
   - Restore from daily backup
   - Run sync reconciliation
   - Notify affected users

2. **Service Outage Recovery**:
   - Activate hot standby
   - Validate data integrity
   - Monitor sync backlog

3. **Corruption Recovery**:
   - Isolate affected entities
   - Restore from point-in-time backup
   - Replay transaction logs

## Security Deployment

### SSL/TLS Certificate

```bash
# Let's Encrypt with certbot
sudo certbot certonly --webroot -w /var/www/html -d yourdomain.com

# Auto-renewal
sudo certbot renew --quiet
```

### Secrets Management

- Never commit secrets to repository
- Use environment secrets manager (GitHub Actions Secrets)
- Rotate API keys monthly
- Use short-lived tokens (< 24 hours)

### Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Rollback Procedure

If critical issues discovered post-deployment:

```bash
# 1. Immediate action
switch-to-previous-version

# 2. Investigation
review-error-logs 2024-02-20
analyze-metrics 2024-02-20

# 3. Fix
patch-critical-issues
run-full-test-suite

# 4. Redeploy
deploy-to-staging
validate-fix
deploy-to-production
```

## Post-Deployment Validation

```bash
# 1. Health checks
curl https://yourdomain.com/api/health

# 2. Smoke tests
npm run test:smoke

# 3. Monitoring dashboard
open https://monitoring.example.com/edenfield

# 4. Load testing
npm run load-test

# 5. User notification
send-deployment-notification
```

## Troubleshooting

### Service Worker Issues

```javascript
// Clear service worker cache
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
});
// Then reload page
```

### Sync Service Unreachable

```javascript
// Error logged with retry
[WARN] Sync service unreachable, retrying in 30s...
[ERROR] Failed to sync after 5 attempts, queuing offline
```

### Performance Degradation

1. Check CPU/memory on servers
2. Review error logs for patterns
3. Check database query performance
4. Analyze sync payload sizes

## Support & Escalation

**Issues during deployment**:
- Contact: devops@example.com
- Slack: #edenfield-incidents
- PagerDuty: escalation-policy-edenfield

---

For more information:
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [SECURITY.md](SECURITY.md) - Security considerations
- [API.md](API.md) - API reference
