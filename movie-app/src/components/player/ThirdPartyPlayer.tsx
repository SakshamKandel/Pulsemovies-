'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { getPlayerUrl } from '@/config/playerProviders';

function PlayerFrame({
    src,
    title,
}: {
    src: string;
    title: string;
}) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [pending, setPending] = useState(true);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setPending(false), 12000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Ensure iframe has NO sandbox attribute so window.frameElement.sandbox detection cannot trigger
        if (iframeRef.current) {
            iframeRef.current.removeAttribute('sandbox');
        }
    }, [src]);

    // Silky-smooth momentum scrolling bridge when mouse wheel is turned over the player iframe
    useEffect(() => {
        let scrollVelocity = 0;
        let animationFrameId: number | null = null;

        const stepScroll = () => {
            if (Math.abs(scrollVelocity) > 0.5) {
                window.scrollBy(0, scrollVelocity * 0.22);
                scrollVelocity *= 0.82;
                animationFrameId = requestAnimationFrame(stepScroll);
            } else {
                scrollVelocity = 0;
                animationFrameId = null;
            }
        };

        const handleMessage = (e: MessageEvent) => {
            if (e.data && e.data.type === 'PULSE_WHEEL_SCROLL') {
                const delta = typeof e.data.deltaY === 'number' ? e.data.deltaY : 0;
                if (delta) {
                    scrollVelocity += delta;
                    if (animationFrameId === null) {
                        animationFrameId = requestAnimationFrame(stepScroll);
                    }
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
            if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="cinema-player-frame relative w-full aspect-video bg-black overflow-hidden select-none">
            <iframe
                ref={iframeRef}
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

    let rawUrl: string;
    try {
        rawUrl = getPlayerUrl('vidlink', tmdbId, type, season, episode);
    } catch {
        return <p className="p-8 text-zinc-400" role="alert">This title or episode is unavailable.</p>;
    }

    // Load through /proxy with Brave's adblock-rust engine and strict mobile defense
    const src = `/proxy?url=${encodeURIComponent(rawUrl)}`;

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
