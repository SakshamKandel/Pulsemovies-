import { readFile } from 'node:fs/promises';
import { Engine, FilterSet } from 'adblock-rs';
import { parse, serialize } from 'parse5';

export const lists = {
  easylist: 'https://easylist.to/easylist/easylist.txt',
  easyprivacy: 'https://easylist.to/easylist/easyprivacy.txt',
  ublock: 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt',
};
export async function loadAdFilter() {
  const filters = new FilterSet();
  for (const name of Object.keys(lists)) {
    // Missing lists fail startup rather than claiming protection with no rules.
    filters.addFilters(await readFile(new URL(`./filter-cache/${name}.txt`, import.meta.url), 'utf8'));
  }
  return new Engine(filters);
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
          if (engine.check(new URL(raw, sourceUrl).href, sourceUrl, types[child.tagName])) { removed++; return false; }
        } catch { /* Leave invalid markup to the HTML parser/browser. */ }
      }
      visit(child);
      return true;
    });
  }
  visit(document);
  // Only static CSS selectors are used here. No remote scriptlets are executed.
  const cosmetics = engine.urlCosmeticResources(sourceUrl);
  const selectors = (cosmetics.hide_selectors || []).filter(s => !/[{}<>]/.test(s) && !s.includes(':has-text('));
  if (selectors.length) {
    const head = document.childNodes.find(n => n.tagName === 'html')?.childNodes.find(n => n.tagName === 'head');
    if (head) head.childNodes.push({ nodeName: 'style', tagName: 'style', attrs: [], namespaceURI: 'http://www.w3.org/1999/xhtml', parentNode: head,
      childNodes: [{ nodeName: '#text', value: selectors.map(s => `${s}{display:none!important}`).join('\n') }] });
  }
  return { html: serialize(document), removed };
}
