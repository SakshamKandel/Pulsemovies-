'use client';

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { getPlayerUrl } from '@/config/playerProviders';

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
            // Preserve browser zoom and ignore horizontal-only gestures.
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
                    This player couldn’t load. Please reload or try again later.
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

    let src: string;
    try {
        src = getPlayerUrl('vidking', tmdbId, type, season, episode);
    } catch {
        return <p className="p-8 text-zinc-400" role="alert">This title or episode is unavailable.</p>;
    }

    return (
        <>
            <PlayerFrame
                key={`${src}:${reload}`}
                src={src}
                title={`${title || 'Movie'} — player`}
            />
            <div className="flex items-center justify-end px-4 md:px-8 py-2.5 bg-black/90 border-t border-white/5">
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
        </>
    );
}
