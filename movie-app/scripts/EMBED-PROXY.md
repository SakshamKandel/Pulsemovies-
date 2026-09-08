# Guarded player experiment

The proxy now combines Brave's `adblock-rs` engine with EasyList, EasyPrivacy,
and uBlock filters, plus the existing Aetherly injected popup guard. Refresh
lists with `node scripts/update-ad-filters.mjs`, then restart the proxy.
The dev launcher downloads missing lists once. Cached lists are not committed;
their original license/attribution comments are preserved in downloaded files.

Use **Try filtered playback** on a local watch page to opt into the proxy.
Direct playback remains the initial mode because Vidlink has been observed to
refuse the injected guard. Filtered mode checks proxy requests and removes
matching static script/frame/image/stylesheet elements before serving HTML.
It also injects supported static cosmetic selectors. It does not execute uBlock
scriptlets or intercept browser requests that bypass the proxy. This is not full
Brave Shields and cannot guarantee ad-free playback on desktop or mobile.

Run `npm run dev` and open http://localhost:3000. The launcher also runs a small
proxy at http://127.0.0.1:3001, isolated from the app hostname. Guarded playback
uses aetherly-embed-guard 0.1.0 to rewrite provider HTML and inject its guard.
No iframe sandbox is added. Direct playback is a manual fallback, without the
injected guard. There is no automatic unguarded fallback.

This reduces common popup calls, but is not an ad-free guarantee. Nested frames,
location navigation, provider changes and bot challenges can defeat it. A
successful HTTP response does not prove a full movie is available or playable.

The local proxy accepts only the three configured HTTPS hosts, pins public IPv4
DNS results, rechecks redirects, forwards no user cookies, and caps response size
and duration. It does not proxy full movie files. Browser-level integration
testing is still required against the actual external players.

For production, deploy an equivalent service on a separate registrable domain
with no Pulse cookies or credentials, add authentication/rate limits appropriate
to your deployment, and configure NEXT_PUBLIC_EMBED_PROXY_ORIGIN. Do not mount
the unsandboxed proxy on the Pulse application origin. The bundled local server
deliberately binds only to loopback and permits only localhost:3000 as an embedder.
