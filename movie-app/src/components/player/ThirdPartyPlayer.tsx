'use client';

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { getPlayerUrl, PLAYER_PROVIDERS, type PlayerProvider } from '@/config/playerProviders';

function PlayerFrame({
    src,
    title,
}: {
    src: string;
    title: string;
}) {
    const [pending, setPending] = useState(true);
    const [failed, setFailed] = useState(false);
    const [isPageScrolling, setIsPageScrolling] = useState(false);

    useEffect(() => {
        let idleTimer: ReturnType<typeof setTimeout> | undefined;
        const onScroll = () => {
            setIsPageScrolling(true);
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => setIsPageScrolling(false), 180);
        };
        const onWheel = (event: WheelEvent) => {
            if (!event.ctrlKey && event.deltaY !== 0) onScroll();
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('wheel', onWheel, { passive: true, capture: true });
        return () => {
            clearTimeout(idleTimer);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('wheel', onWheel, true);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setPending(false), 12000);
        return () => clearTimeout(timer);
    }, []);

    // Listen for wheel events bridged from inside the player iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'PULSE_WHEEL_SCROLL') {
                window.scrollBy({
                    top: event.data.deltaY || 0,
                    left: event.data.deltaX || 0,
                    behavior: 'auto',
                });
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Defuse window.open in the top window so embedded frames cannot use top.open/parent.open to launch ads
    useEffect(() => {
        const origOpen = window.open;
        try {
            window.open = () => null;
        } catch {
            /* ignore */
        }
        return () => {
            try {
                window.open = origOpen;
            } catch {
                /* ignore */
            }
        };
    }, []);

    return (
        <div
            className="cinema-player-frame relative w-full aspect-video bg-black overflow-hidden select-none"
        >
            <iframe
                key={src}
                src={src}
                title={title}
                className="absolute inset-0 w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => setPending(false)}
                onError={() => {
                    setPending(false);
                    setFailed(true);
                }}
            />

            {/* Continue page scrolling across the iframe, then return pointer input
                to the video controls as soon as scrolling settles. */}
            {isPageScrolling && <div className="absolute inset-0 z-10 touch-pan-y bg-transparent" aria-hidden="true" />}

            {pending && (
                <div
                    className="absolute inset-0 bg-black pointer-events-none flex items-center justify-center gap-3 text-sm text-zinc-400"
                    role="status"
                >
                    <Loader2 size={20} className="animate-spin text-violet-400" /> Loading player…
                </div>
            )}
            {failed && (
                <div
                    className="absolute inset-0 bg-black flex items-center justify-center p-6 text-center text-sm text-zinc-400"
                    role="alert"
                >
                    This player couldn’t load. Please reload or switch server.
                </div>
            )}
        </div>
    );
}

export function ThirdPartyPlayer({
    tmdbId,
    type,
    season = 1,
    episode = 1,
    title,
}: {
    tmdbId: number;
    type: 'movie' | 'tv';
    season?: number;
    episode?: number;
    title?: string;
}) {
    const [reload, setReload] = useState(0);
    const [provider, setProvider] = useState<PlayerProvider>('vidlink');
    const [useAdblock, setUseAdblock] = useState(true);

    let rawUrl: string;
    try {
        rawUrl = getPlayerUrl(provider, tmdbId, type, season, episode);
    } catch {
        return <p className="p-8 text-zinc-400" role="alert">This title or episode is unavailable.</p>;
    }

    // In Adblocker mode, use the in-app proxy that strips ad scripts and injects the guard script.
    // In Direct mode, load the upstream URL directly. Neither mode sets the iframe sandbox attribute.
    const src = useAdblock
        ? `/proxy?url=${encodeURIComponent(rawUrl)}`
        : rawUrl;

    return (
        <>
            <PlayerFrame
                key={`${src}:${reload}`}
                src={src}
                title={`${title || 'Movie'} — player`}
            />
            <div className="flex flex-wrap gap-2 items-center justify-between px-4 md:px-8 py-2.5 bg-black/90 border-t border-white/5">
                <div className="flex items-center gap-2" role="group" aria-label="Playback server">
                    <span className="text-xs text-zinc-400 font-medium mr-1">Server:</span>
                    {PLAYER_PROVIDERS.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            aria-pressed={provider === item.id}
                            disabled={!item.available}
                            onClick={() => setProvider(item.id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                provider === item.id
                                    ? 'bg-violet-600 text-white shadow-sm ring-1 ring-violet-500/50'
                                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setUseAdblock(v => !v)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            useAdblock
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={useAdblock ? 'Ad blocker is active (no sandbox, zero popups)' : 'Direct mode without ad blocker'}
                    >
                        <ShieldCheck size={13} className={useAdblock ? 'text-emerald-400' : 'text-zinc-500'} />
                        <span>{useAdblock ? 'Adblocker: Active' : 'Direct Stream'}</span>
                    </button>
                    <button
                        onClick={() => setReload(count => count + 1)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                        aria-label="Reload player"
                        title="Reload player"
                    >
                        <RefreshCw size={13} />
                        <span>Reload</span>
                    </button>
                </div>
            </div>
            <p className="px-4 md:px-8 pb-3 text-xs text-zinc-500">
                Primary server: JW Player. Secondary server: VidKing. Built-in adblocker neutralizes popups without triggering sandbox detection.
            </p>
        </>
    );
}
