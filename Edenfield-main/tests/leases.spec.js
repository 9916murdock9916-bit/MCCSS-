import { LeaseManager } from '../core/leases.js';
import { LeaseTokens } from '../core/lease-tokens.js';

beforeAll(() => {
  // ensure clean in-memory state
  LeaseManager.initSync();
  LeaseManager.leases = [];
});

test('create and sign lease', async () => {
  const lease = await LeaseManager.createLease({ ownerId: 'owner1', organismId: 'org1' });
  expect(lease.ownerId).toBe('owner1');
  expect(LeaseManager.isOwnerOfSync('owner1', 'org1')).toBe(true);

  const token = await LeaseTokens.signLease(lease);
  const res = await LeaseTokens.verify(token);
  expect(res.valid).toBe(true);
  expect(res.payload.leaseId).toBe(lease.id);
});
