import { describe, it, expect } from 'vitest';

describe('Pinata credentials validation', () => {
  it('should authenticate successfully with the Pinata API', async () => {
    const jwt = process.env.PINATA_JWT;
    expect(jwt, 'PINATA_JWT deve essere configurato').toBeTruthy();

    const res = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      headers: { 'Authorization': `Bearer ${jwt}` }
    });

    expect(res.status).toBe(200);
    const data = await res.json() as { message: string };
    expect(data.message).toContain('Congratulations');
  });

  it('should be able to pin JSON to IPFS', async () => {
    const jwt = process.env.PINATA_JWT;
    const testPayload = {
      pinataContent: { test: true, timestamp: Date.now(), source: 'proofpress-verify-test' },
      pinataMetadata: { name: 'proofpress-test-ping' }
    };

    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    expect(res.status, `Pinata pinning fallito con status ${res.status}`).toBe(200);
    const data = await res.json() as { IpfsHash: string };
    expect(data.IpfsHash).toBeTruthy();
    expect(data.IpfsHash).toMatch(/^Qm|^bafy/);
    console.log('✅ Test CID:', data.IpfsHash);
  });
});

describe('Pinata Gateway Key validation', () => {
  it('should access a pinned file via the dedicated gateway', async () => {
    const jwt = process.env.PINATA_JWT;
    const gatewayKey = process.env.PINATA_GATEWAY_KEY;
    const gatewayDomain = process.env.PINATA_GATEWAY_DOMAIN;
    expect(gatewayKey, 'PINATA_GATEWAY_KEY deve essere configurato').toBeTruthy();
    expect(gatewayDomain, 'PINATA_GATEWAY_DOMAIN deve essere configurato').toBeTruthy();

    // Prima pinna un file di test sull'account
    const pinRes = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinataContent: { gateway_test: true, ts: Date.now() }, pinataMetadata: { name: 'gateway-key-test' } })
    });
    const pinData = await pinRes.json() as { IpfsHash: string };
    expect(pinRes.status).toBe(200);
    const cid = pinData.IpfsHash;
    console.log('CID pinnato per test gateway:', cid);

    // Ora accedi via gateway dedicato con il CID appena pinnato
    const url = `https://${gatewayDomain}/ipfs/${cid}?pinataGatewayToken=${gatewayKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    // Il gateway dedicato deve rispondere 200 per file pinnati sull'account
    expect(res.status).toBe(200);
    console.log(`✅ Gateway dedicato risponde: ${res.status} (${gatewayDomain})`);
  });
});
