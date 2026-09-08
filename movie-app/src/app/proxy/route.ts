import { NextRequest, NextResponse } from 'next/server';
import { FiltersEngine, Request as AdblockRequest } from '@ghostery/adblocker';

export const dynamic = 'force-dynamic';

const ALLOWED_HOST_REGEXES = [
    /^([a-z0-9-]+\.)?vidlink\.pro$/i,
    /^([a-z0-9-]+\.)?vidking\.net$/i,
    /^([a-z0-9-]+\.)?vidsrc\.to$/i,
    /^([a-z0-9-]+\.)?vidsrc\.cc$/i,
    /^([a-z0-9-]+\.)?vidsrc\.xyz$/i,
    /^([a-z0-9-]+\.)?videasy\.to$/i,
];

// Core streaming ad network rules for instant, zero-latency ad blocking
const CORE_AD_RULES = `
||brightadnetwork.com^
||popads.net^
||adsterra.com^
||propellerads.com^
||clickadu.com^
||exoclick.com^
||monetag.com^
||trafficjunky.com^
||trafficstars.com^
||adtrue.com^
||ad-delivery.net^
||adnxs.com^
||doubleclick.net^
||google-analytics.com^
||googlesyndication.com^
||scorecardresearch.com^
||histats.com^
||onclickbright.com^
||juicyads.com^
||tsyndicate.com^
||traffichaus.com^
||hilltopads.net^
||vidsrc.me/ad
||vidlink.pro/ads
||vidking.net/ads
/ad-banner/
/pop-under/
/popup/
`.trim();

let filterEngine: FiltersEngine | null = null;
function getEngine(): FiltersEngine {
    if (!filterEngine) {
        filterEngine = FiltersEngine.parse(CORE_AD_RULES);
    }
    return filterEngine;
}

function createGuardScript(): string {
    return `
<script>
(function() {
  'use strict';
  // 1. Defuse window.open inside the player browsing context
  try {
    window.open = function() { return null; };
    window.showModalDialog = function() { return null; };
  } catch(e) {}

  // 2. Intercept createElement('a') so that ad scripts creating programmatic links fail
  var origCreate = document.createElement;
  document.createElement = function(tag) {
    var el = origCreate.apply(this, arguments);
    if (tag && tag.toLowerCase() === 'a') {
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

  // 3. Capture-phase blocker for BOTH mobile touch events and desktop clicks
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

  // 4. Intercept HTMLAnchorElement.prototype.click & HTMLFormElement.prototype.submit
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

  // 5. Block location hijacking
  try {
    if (location.assign) location.assign = function() {};
    if (location.replace) location.replace = function() {};
  } catch(e) {}

  // 6. Bridge mouse wheel events from inside iframe to parent window for smooth scrolling
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

  // 7. Inject cosmetic CSS rules
  var css = \`
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
        const engine = getEngine();

        // Rewrite relative resources to point to upstream origin
        html = html.replace(/(src|href|action)=["']\/(?!\/)/g, `$1="${origin}/`);

        // Use @ghostery/adblocker pure-JS engine to purge any script matching ad rules
        html = html.replace(/<script[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/gi, (match, src) => {
            try {
                const fullUrl = src.startsWith('http') ? src : `${origin}${src.startsWith('/') ? '' : '/'}${src}`;
                const req = AdblockRequest.fromRawDetails({ url: fullUrl, sourceUrl: targetUrl, type: 'script' });
                if (engine.match(req)?.match) {
                    return '';
                }
            } catch {
                /* ignore */
            }
            return match;
        });

        // Neutralize known ad network endpoints inside upstream bundles
        html = html.replaceAll('https://brightadnetwork.com/jump/next.php', 'about:blank#blocked');
        html = html.replaceAll('zone:"9905914"', 'zone:"0"');
        html = html.replaceAll('limitAds:!1', 'limitAds:!0');

        const baseTag = `<base href="${origin}/">`;
        const guardScript = createGuardScript();
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
