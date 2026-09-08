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
        // A frame load event cannot tell us whether the provider can play the movie.
        // Stop covering its UI after a short wait so its own errors remain visible.
        const timer = setTimeout(() => setPending(false), 12000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Ensure iframe has NO sandbox attribute so window.frameElement.sandbox detection cannot trigger
        if (iframeRef.current) {
            iframeRef.current.removeAttribute('sandbox');
        }
    }, [src]);

    return (
        <div className="cinema-player-frame relative aspect-video w-full bg-black overflow-hidden">
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

    let src: string;
    try {
        src = getPlayerUrl('vidlink', tmdbId, type, season, episode);
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
            <div className="flex items-center justify-end px-4 md:px-8 py-2 bg-black">
                <button
                    onClick={() => setReload(count => count + 1)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded transition-colors"
                    aria-label="Reload player"
                >
                    <RefreshCw size={13} /> Reload player
                </button>
            </div>
        </>
    );
}


