import { NextRequest, NextResponse } from 'next/server';
import adblockRust from 'adblock-rs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_HOST_REGEXES = [
    /(^|\.)vidlink\.pro$/i,
    /(^|\.)vidfast\.pro$/i,
    /(^|\.)embed\.su$/i,
    /(^|\.)vidsrc\.to$/i,
    /(^|\.)vidsrc\.xyz$/i,
    /(^|\.)videasy\.to$/i,
    /(^|\.)2embed\.cc$/i,
];

// Brave Shields & EasyList ad-blocking rules
const BRAVE_ADBLOCK_RULES = [
    '||brightadnetwork.com^',
    '||popcash.net^',
    '||monetag.com^',
    '||adsterra.com^',
    '||exoclick.com^',
    '||juicyads.com^',
    '||histats.com^',
    '||onclickprediction.com^',
    '||doubleclick.net^',
    '||googleads.g.doubleclick.net^',
    '||trafficjunky.com^',
    '||highcpmrevenuenetwork.com^',
    '||al5sm.com^',
    '||tsyndicate.com^',
    '||hilltopads.com^',
    '||propellerads.com^',
    '||clickadu.com^',
    '||popads.net^',
    '||yandex.ru^',
    '||adx.com^',
    'vidlink.pro##.ad-banner',
    'vidlink.pro##div[class*="ad"]',
    'vidlink.pro##div[id*="ad"]',
    'vidlink.pro##iframe[src*="ad"]',
    'vidlink.pro##div[style*="z-index: 2147483647"]',
    'vidlink.pro##div[style*="z-index: 999999"]',
    'vidlink.pro##div[style*="z-index: 99999"]',
].join('\n');

// Initialize Brave's adblock-rust engine singleton
let adblockEngine: InstanceType<typeof adblockRust.Engine> | null = null;
function getAdblockEngine() {
    if (!adblockEngine) {
        const filterSet = new adblockRust.FilterSet(false);
        filterSet.addFilters(BRAVE_ADBLOCK_RULES);
        adblockEngine = new adblockRust.Engine(filterSet);
    }
    return adblockEngine;
}

// Custom strict ad-blocking and interaction guard script injected into <head>
function createGuardScript(cosmeticSelectors: string[]): string {
    const cosmeticCss = cosmeticSelectors.length > 0
        ? `${cosmeticSelectors.join(', ')} { display: none !important; visibility: hidden !important; pointer-events: none !important; width: 0 !important; height: 0 !important; opacity: 0 !important; }`
        : '';

    return `
<script>
(function() {
  if (window.__pulseStrictGuard) return;
  window.__pulseStrictGuard = true;

  // 1. Permanently defuse and freeze window.open to block popups & popunders on PC and mobile
  var fakeWin = {
    closed: false,
    close: function() { this.closed = true; },
    focus: function() {},
    blur: function() {},
    postMessage: function() {},
    moveTo: function() {},
    resizeTo: function() {},
    location: { href: '', assign: function() {}, replace: function() {}, reload: function() {} },
    document: { write: function() {}, writeln: function() {}, open: function() {}, close: function() {} }
  };

  try {
    Object.defineProperty(window, 'open', {
      get: function() { return function() { return fakeWin; }; },
      set: function() {},
      configurable: false
    });
  } catch(e) {
    window.open = function() { return fakeWin; };
  }

  // 2. Lock top.open and parent.open if accessible
  try {
    if (window.top && window.top !== window) {
      window.top.open = function() { return fakeWin; };
    }
  } catch(e) {}
  try {
    if (window.parent && window.parent !== window) {
      window.parent.open = function() { return fakeWin; };
    }
  } catch(e) {}

  // 3. Intercept document.createElement to block ad iframes and workaround popup anchors
  var origCreateElement = Document.prototype.createElement;
  Document.prototype.createElement = function(tagName) {
    var el = origCreateElement.apply(this, arguments);
    var tag = (tagName || '').toLowerCase();
    if (tag === 'iframe') {
      el.addEventListener('load', function() {
        try {
          if (el.contentWindow) {
            el.contentWindow.open = function() { return fakeWin; };
          }
        } catch(err) {}
      });
    } else if (tag === 'a') {
      var origClick = el.click;
      el.click = function() {
        var target = (el.getAttribute('target') || '').toLowerCase();
        var href = (el.href || '').toLowerCase();
        if (target === '_blank' || target === '_top' || target === '_parent' ||
            href.includes('pop') || href.includes('ad') || href.includes('track') || href.includes('traffic') || href.includes('brightad')) {
          return;
        }
        return origClick.apply(this, arguments);
      };
    }
    return el;
  };

  // 4. Capture-phase blocker for BOTH mobile touch events and desktop clicks
  function blockAdInteraction(e) {
    var el = e.target;
    while (el && el !== document) {
      if (el.tagName === 'A' && el.href) {
        var target = (el.getAttribute('target') || '').toLowerCase();
        var href = (el.href || '').toLowerCase();
        if (target === '_blank' || target === '_top' || target === '_parent' ||
            href.includes('pop') || href.includes('ad') || href.includes('track') || href.includes('traffic') || href.includes('brightad')) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }
      // Detect and remove full-screen invisible click-jack layers
      try {
        var style = window.getComputedStyle(el);
        var zIndex = parseInt(style.zIndex, 10);
        if (zIndex >= 10000 && style.position === 'fixed' && !el.querySelector('video')) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          el.remove();
          return false;
        }
      } catch(err) {}
      el = el.parentNode;
    }
  }

  // Defuse on all touch and click interactions (crucial for mobile phones)
  var events = ['click', 'auxclick', 'touchstart', 'touchend', 'pointerdown', 'pointerup'];
  for (var i = 0; i < events.length; i++) {
    document.addEventListener(events[i], blockAdInteraction, true);
  }

  // 5. Intercept HTMLAnchorElement.prototype.click & HTMLFormElement.prototype.submit
  var origAnchorClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function() {
    var target = (this.getAttribute('target') || '').toLowerCase();
    var href = (this.href || '').toLowerCase();
    if (target === '_blank' || target === '_top' || target === '_parent' ||
        href.includes('pop') || href.includes('ad') || href.includes('brightad')) {
      return;
    }
    return origAnchorClick.apply(this, arguments);
  };

  var origFormSubmit = HTMLFormElement.prototype.submit;
  HTMLFormElement.prototype.submit = function() {
    var target = (this.getAttribute('target') || '').toLowerCase();
    if (target === '_blank' || target === '_top' || target === '_parent') return;
    return origFormSubmit.apply(this, arguments);
  };

  // 6. Block location hijacking
  try {
    if (location.assign) location.assign = function() {};
    if (location.replace) location.replace = function() {};
  } catch(e) {}

  // 7. Bridge mouse wheel events from inside iframe to parent window for smooth scrolling
  window.addEventListener('wheel', function(e) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'PULSE_WHEEL_SCROLL',
        deltaY: e.deltaY,
        deltaX: e.deltaX,
        deltaMode: e.deltaMode
      }, '*');
    }
  }, { passive: true });

  // 8. Inject Brave cosmetic CSS rules
  var css = ${JSON.stringify(cosmeticCss)} + \`
    div[style*="z-index: 2147483647"],
    div[style*="z-index: 999999"],
    div[style*="z-index: 99999"],
    div[id*="ad-"], div[class*="ad-"],
    div[id*="pop-"], div[class*="pop-"],
    div[class*="click-layer"], div[id*="click-layer"],
    iframe[src*="ad"], iframe[id*="ad"], iframe[class*="ad"] {
      display: none !important;
      pointer-events: none !important;
      visibility: hidden !important;
      width: 0 !important;
      height: 0 !important;
      opacity: 0 !important;
    }
  \`;
  var s = document.createElement('style');
  s.textContent = css;
  if (document.head) document.head.appendChild(s);
  else document.addEventListener('DOMContentLoaded', function() { document.head.appendChild(s); });
})();
</script>
`;
}

export async function GET(request: NextRequest) {
    const targetUrl = request.nextUrl.searchParams.get('url');
    if (!targetUrl) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    let parsed: URL;
    try {
        parsed = new URL(targetUrl);
    } catch {
        return new NextResponse('Invalid target URL', { status: 400 });
    }

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return new NextResponse('Unsupported protocol', { status: 400 });
    }

    const isAllowed = ALLOWED_HOST_REGEXES.some(regex => regex.test(parsed.hostname));
    if (!isAllowed) {
        return new NextResponse('Host not allowed', { status: 403 });
    }

    try {
        const BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
        const clientUA = request.headers.get('user-agent');
        const userAgent = (clientUA && !clientUA.includes('node') && !clientUA.includes('undici')) ? clientUA : BROWSER_USER_AGENT;

        const upstream = await fetch(parsed.href, {
            headers: {
                'User-Agent': userAgent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': `${parsed.origin}/`,
            },
            redirect: 'follow',
        });

        if (!upstream.ok) {
            return new NextResponse(`Upstream responded with HTTP ${upstream.status}`, { status: upstream.status });
        }

        const contentType = upstream.headers.get('content-type') || '';
        const isHtml = contentType.includes('text/html') || contentType.includes('application/xhtml');

        if (!isHtml) {
            const body = await upstream.arrayBuffer();
            return new NextResponse(body, {
                status: upstream.status,
                headers: {
                    'Content-Type': contentType || 'application/octet-stream',
                    'Cache-Control': 'no-store',
                },
            });
        }

        let html = await upstream.text();
        const origin = parsed.origin;
        const engine = getAdblockEngine();

        // Rewrite relative resources to point to upstream origin
        html = html.replace(/(src|href|action)=["']\/(?!\/)/g, `$1="${origin}/`);

        // Use Brave adblock-rust engine to purge any script matching ad rules
        html = html.replace(/<script[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/gi, (match, src) => {
            const fullUrl = src.startsWith('http') ? src : `${origin}${src.startsWith('/') ? '' : '/'}${src}`;
            if (engine.check(fullUrl, origin, 'script')) {
                return '';
            }
            return match;
        });

        // Neutralize known ad network endpoints inside upstream bundles
        html = html.replaceAll('https://brightadnetwork.com/jump/next.php', 'about:blank#blocked');
        html = html.replaceAll('zone:"9905914"', 'zone:"0"');
        html = html.replaceAll('limitAds:!1', 'limitAds:!0');

        // Extract Brave cosmetic selectors for this target URL
        const cosmetic = engine.urlCosmeticResources(targetUrl);
        const baseTag = `<base href="${origin}/">`;
        const guardScript = createGuardScript(cosmetic?.hide_selectors || []);
        const injection = `${baseTag}${guardScript}`;

        if (html.includes('<head>')) {
            html = html.replace('<head>', `<head>${injection}`);
        } else {
            html = `${injection}${html}`;
        }

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store',
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch (err: any) {
        return new NextResponse(`Proxy error: ${err?.message || 'Failed to fetch source'}`, { status: 502 });
    }
}
