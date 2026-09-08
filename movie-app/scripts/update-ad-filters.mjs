import { mkdir, writeFile, rename } from 'node:fs/promises';
import { lists } from './ad-filter.mjs';

await mkdir(new URL('./filter-cache/', import.meta.url), { recursive: true });
for (const [name, url] of Object.entries(lists)) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  const reader = response.body.getReader();
  let size = 0; const chunks = [];
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.length;
    if (size > 8 * 1024 * 1024) { await reader.cancel(); throw new Error('Filter list too large'); }
    chunks.push(Buffer.from(value));
  }
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.startsWith('[Adblock') && !text.startsWith('!')) throw new Error(`${name}: unexpected filter format`);
  const file = new URL(`./filter-cache/${name}.txt`, import.meta.url);
  const temp = new URL(`./filter-cache/${name}.tmp`, import.meta.url);
  await writeFile(temp, text); await rename(temp, file);
  console.log(`Updated ${name}: ${size} bytes`);
}
