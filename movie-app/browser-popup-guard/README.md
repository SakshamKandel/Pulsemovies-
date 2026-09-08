# Pulse Player Tab Guard

This optional browser extension closes new tabs/windows whose navigation was
opened by an iframe on http://localhost:3000/movie/ID/watch or /tv/ID/watch.
Ordinary Pulse links and tabs from other sites are left alone. This includes
intentional new-window links inside the player; turn off the extension to use those.

## Install locally

In Chrome, Brave, or Edge, open the browser's Extensions page, enable Developer
mode, choose **Load unpacked**, and select this `browser-popup-guard` directory.
Refresh the Pulse watch page afterward. Installation is per browser; this is not
automatically installed for website visitors. Disable/remove it from Extensions.

## Scope

This is a small extension using Chromium's webNavigation and tabs APIs, not
Brave's adblock-rust engine or a replacement for Brave Shields. It acts after
tab creation: an ad request or brief flash may occur before closure. It does not
filter video ads, in-frame overlays, or same-tab redirects. It does not inspect
page contents, collect data, or make network requests.

The current movie player uses a direct external iframe; the separate proxy
cannot filter that traffic. Making every viewer ad-free requires a compatible
ad-free media source or browser-level filtering on each viewer's device.
