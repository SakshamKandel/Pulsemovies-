import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createEmbedGuardHandler, buildGuardScript } from 'aetherly-embed-guard';
process.env.EMBED_PROXY_TEST = '1';
const { boundedFetch, publicIPv4 } = await import('./embed-proxy.mjs');

test('rejects private targets and non-provider URLs before fetching', async () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '192.168.1.1', '172.16.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0']) assert.equal(publicIPv4(ip), false);
  assert.equal(publicIPv4('8.8.8.8'), true);
  for (const url of ['http://vidlink.pro/movie/1', 'https://localhost/', 'https://vidlink.pro.evil.test/', 'https://user:pass@vidlink.pro/']) await assert.rejects(boundedFetch(url));
});

test('injects guard before upstream scripts and limits hosts', async () => {
  const proxy = createEmbedGuardHandler({ providerHosts: [{ provider: 'test', hostRegex: /^vidlink\.pro$/ }], fetchImpl: async () => new Response('<html><head><script>original()</script></head><body></body></html>', { headers: { 'content-type': 'text/html' } }) });
  const html = await (await proxy.GET(new Request('http://127.0.0.1:3001/embed?url=https://vidlink.pro/movie/1'))).text();
  assert.ok(html.indexOf('window.__aetherlyGuard') < html.indexOf('original()'));
  assert.equal((await proxy.GET(new Request('http://127.0.0.1:3001/embed?url=https://example.com'))).status, 403);
});

test('guard blocks window.open and targeted programmatic links/forms', () => {
  let opened = 0; let submitted = 0; let clicked = 0;
  class Form { submit() { submitted++; } getAttribute() { return '_blank'; } }
  class Anchor { click() { clicked++; } getAttribute() { return '_top'; } }
  class XHR { open() {} }
  const context = { window: { open() { opened++; } }, navigator: {}, document: { addEventListener() {} }, HTMLFormElement: Form, HTMLAnchorElement: Anchor, XMLHttpRequest: XHR, location: { href: 'http://127.0.0.1:3001/embed', origin: 'http://127.0.0.1:3001' }, URL };
  const script = buildGuardScript('https://vidlink.pro').replace(/^<script>/, '').replace(/<\/script>$/, '');
  vm.runInNewContext(script, context);
  context.window.open('https://example.com'); new Form().submit(); new Anchor().click();
  assert.equal(opened + submitted + clicked, 0);
});
