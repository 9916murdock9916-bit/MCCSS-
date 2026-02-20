import fetch from 'node-fetch';

export async function fetchSecretFromVault(path, key) {
  const VAULT_ADDR = process.env.VAULT_ADDR;
  const VAULT_TOKEN = process.env.VAULT_TOKEN;
  if (!VAULT_ADDR || !VAULT_TOKEN) throw new Error('VAULT_ADDR and VAULT_TOKEN required');
  const url = `${VAULT_ADDR}/v1/${path}`;
  const res = await fetch(url, { headers: { 'X-Vault-Token': VAULT_TOKEN } });
  if (!res.ok) throw new Error(`vault fetch failed: ${res.status}`);
  const body = await res.json();
  return body.data && (body.data[key] || body.data);
}
