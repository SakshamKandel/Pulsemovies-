// Best effort for this window only. Cross-origin frames have their own window.open
// and document; this code cannot intercept their popups or close their tabs.
const installations = new WeakMap();

/** @param {Window} host */
export function installPopupBlocker(host) {
    let entry = installations.get(host);
    if (!entry) {
        const originalOpen = host.open;
        const blockedOpen = () => null;
        /** @param {Event} event */
        const preventSyntheticNewTab = (event) => {
            // Preserve deliberate link clicks (including keyboard/middle-click).
            if (event.isTrusted) return;
            const target = /** @type {Element | null} */ (event.target);
            const link = target?.closest?.('a[href], area[href]');
            const destination = link?.getAttribute('target')?.toLowerCase();
            if (destination && !['_self', '_parent', '_top'].includes(destination)) {
                event.preventDefault();
            }
        };
        host.open = blockedOpen;
        host.document.addEventListener('click', preventSyntheticNewTab, true);
        host.document.addEventListener('auxclick', preventSyntheticNewTab, true);
        entry = { originalOpen, blockedOpen, preventSyntheticNewTab, users: 0 };
        installations.set(host, entry);
    }
    entry.users++;
    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        if (--entry.users > 0) return;
        // Don't overwrite a different handler installed after ours.
        if (host.open === entry.blockedOpen) host.open = entry.originalOpen;
        host.document.removeEventListener('click', entry.preventSyntheticNewTab, true);
        host.document.removeEventListener('auxclick', entry.preventSyntheticNewTab, true);
        installations.delete(host);
    };
}
