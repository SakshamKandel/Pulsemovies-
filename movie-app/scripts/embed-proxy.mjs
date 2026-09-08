import http from 'node:http';
import https from 'node:https';
import { lookup } from 'node:dns/promises';
import { createEmbedGuardHandler } from 'aetherly-embed-guard';

const hosts = new Set(['vidlink.pro', 'player.videasy.to', 'vidsrc.to']);
const port = Number(process.env.EMBED_PROXY_PORT || 3001);

export function publicIPv4(ip) {
  const [a, b] = ip.split('.').map(Number);
  return a > 0 && a < 224 && a !== 10 && a !== 127 &&
    !(a === 169 && b === 254) && !(a === 172 && b >= 16 && b <= 31) &&
    !(a === 192 && (b === 168 || b === 0)) && !(a === 100 && b >= 64 && b <= 127) &&
    !(a === 198 && (b === 18 || b === 19));
}

// Pin the resolved public address and validate every redirect. No browser cookies,
// authentication headers, or arbitrary upstream hosts are forwarded.
export async function boundedFetch(input, options = {}, hops = 0) {
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.port || url.username || url.password || !hosts.has(url.hostname)) throw new Error('Host not allowed');
  const addresses = (await lookup(url.hostname, { family: 4, all: true })).map(entry => entry.address);
  if (!addresses.length || addresses.some(ip => !publicIPv4(ip))) throw new Error('Address not allowed');
  const response = await new Promise((resolve, reject) => {
    const request = https.request(url, {
      headers: options.headers,
      signal: options.signal,
      lookup: (_host, lookupOptions, callback) => lookupOptions.all
        ? callback(null, [{ address: addresses[0], family: 4 }])
        : callback(null, addresses[0], 4),
    }, incoming => {
      const chunks = []; let size = 0;
      incoming.on('data', chunk => {
        size += chunk.length;
        if (size > 4 * 1024 * 1024) request.destroy(new Error('Response too large'));
        else chunks.push(chunk);
      });
      incoming.on('error', reject);
      incoming.on('end', () => {
        clearTimeout(timer);
        const headers = new Headers();
        for (const [key, value] of Object.entries(incoming.headers)) if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        resolve(new Response(incoming.statusCode === 204 || incoming.statusCode === 304 ? null : Buffer.concat(chunks), { status: incoming.statusCode, headers }));
      });
    });
    const timer = setTimeout(() => request.destroy(new Error('Upstream timeout')), 12000);
    request.on('error', error => { clearTimeout(timer); reject(error); });
    request.end();
  });
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    if (hops >= 3 || !response.headers.get('location')) throw new Error('Redirect limit');
    return boundedFetch(new URL(response.headers.get('location'), url), options, hops + 1);
  }
  return response;
}

const handler = createEmbedGuardHandler({
  proxyPath: `http://127.0.0.1:${port}/embed`, retries: 0, requestTimeoutMs: 15000,
  providerHosts: [...hosts].map(host => ({ provider: host, hostRegex: new RegExp(`^${host.replaceAll('.', '\\.')}$`, 'i') })),
  fetchImpl: boundedFetch,
});

export const server = http.createServer(async (req, res) => {
  // Reject other Host headers, including DNS-rebinding requests.
  if (req.headers.host !== `127.0.0.1:${port}`) { res.writeHead(403).end(); return; }
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (req.method !== 'GET') { res.writeHead(405).end(); return; }
  if (url.pathname === '/health') { res.writeHead(200).end('Pulse embed proxy'); return; }
  if (url.pathname !== '/embed' && url.pathname !== '/proxy') { res.writeHead(404).end(); return; }
  try {
    const response = await handler.GET(new Request(url));
    res.writeHead(response.status, {
      'Content-Type': response.headers.get('content-type') || 'text/plain',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "frame-ancestors http://localhost:3000; object-src 'none'",
    });
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(502, { 'Content-Type': 'text/plain' }).end('Player proxy unavailable. Try another server or direct playback.'); }
});

if (process.env.EMBED_PROXY_TEST !== '1') server.listen(port, '127.0.0.1', () => console.log(`Embed proxy: http://127.0.0.1:${port}`));
