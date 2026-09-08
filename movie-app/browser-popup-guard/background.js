// Browser permissions are necessary: the website cannot close cross-origin tabs.
chrome.webNavigation.onCreatedNavigationTarget.addListener(async details => {
  if (details.sourceFrameId <= 0 || details.tabId === details.sourceTabId) return;
  try {
    const source = await chrome.tabs.get(details.sourceTabId);
    const url = new URL(source.url);
    if (url.origin !== 'http://localhost:3000' || !/^\/(movie|tv)\/\d+\/watch\/?$/.test(url.pathname)) return;
    await chrome.tabs.remove(details.tabId);
  } catch {
    // Source or target may already have closed. Never close an unrelated tab.
  }
});
