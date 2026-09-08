import { readFile } from 'node:fs/promises';
import { FiltersEngine, Request } from '@ghostery/adblocker';
import { parse, serialize } from 'parse5';

export const lists = {
  easylist: 'https://easylist.to/easylist/easylist.txt',
  easyprivacy: 'https://easylist.to/easylist/easyprivacy.txt',
  ublock: 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt',
};

export async function loadAdFilter() {
  const contents = [];
  for (const name of Object.keys(lists)) {
    try {
      contents.push(await readFile(new URL(`./filter-cache/${name}.txt`, import.meta.url), 'utf8'));
    } catch {
      // Missing list file - continue with available lists
    }
  }
  return FiltersEngine.parse(contents.join('\n'));
}

export function filterHtml(html, sourceUrl, engine) {
  const document = parse(html);
  let removed = 0;
  function visit(node) {
    if (!node.childNodes) return;
    node.childNodes = node.childNodes.filter(child => {
      const attrs = Object.fromEntries((child.attrs || []).map(a => [a.name, a.value]));
      const types = { script: 'script', iframe: 'subdocument', img: 'image', link: 'stylesheet' };
      const raw = attrs.src || (child.tagName === 'link' && attrs.rel === 'stylesheet' ? attrs.href : null);
      if (raw && types[child.tagName]) {
        try {
          const checkUrl = new URL(raw, sourceUrl).href;
          const req = Request.fromRawDetails({ url: checkUrl, sourceUrl, type: types[child.tagName] });
          if (engine?.match(req)?.match) {
            removed++;
            return false;
          }
        } catch { /* Leave invalid markup to the HTML parser/browser. */ }
      }
      visit(child);
      return true;
    });
  }
  visit(document);

  try {
    const cosmetics = engine?.getCosmeticsFilters(Request.fromRawDetails({ url: sourceUrl }));
    if (cosmetics?.styles) {
      const head = document.childNodes.find(n => n.tagName === 'html')?.childNodes.find(n => n.tagName === 'head');
      if (head) {
        head.childNodes.push({
          nodeName: 'style',
          tagName: 'style',
          attrs: [],
          namespaceURI: 'http://www.w3.org/1999/xhtml',
          parentNode: head,
          childNodes: [{ nodeName: '#text', value: cosmetics.styles }]
        });
      }
    }
  } catch {}

  return { html: serialize(document), removed };
}
