'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Maximize, Minimize, RefreshCw } from 'lucide-react';
import { getPlayerUrl } from '@/config/playerProviders';

function PlayerFrame({
    src,
    title,
    isFullscreen,
    onToggleFullscreen,
    containerRef,
}: {
    src: string;
    title: string;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
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

    // Give focus to iframe on mouse enter so keys work without requiring an ad-triggering mouse click
    const handleMouseEnter = () => {
        try {
            iframeRef.current?.focus();
        } catch {
            /* ignore focus error */
        }
    };

    return (
        <div
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            className="cinema-player-frame group relative aspect-video w-full bg-black overflow-hidden select-none"
        >
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

            {/* Floating Fullscreen button on hover in top-right corner to avoid clicking inside the iframe */}
            <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
                <button
                    onClick={onToggleFullscreen}
                    className="p-2 rounded-lg bg-black/75 hover:bg-black/95 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition-all shadow-xl hover:scale-105"
                    title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                    aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </button>
            </div>

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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;
        try {
            if (!document.fullscreenElement) {
                if (containerRef.current.requestFullscreen) {
                    await containerRef.current.requestFullscreen();
                } else if ((containerRef.current as any).webkitRequestFullscreen) {
                    await (containerRef.current as any).webkitRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen) {
                    await (document as any).webkitExitFullscreen();
                }
            }
        } catch (err) {
            console.error('Fullscreen toggle error:', err);
        }
    }, []);

    // Listen to fullscreen changes across all browsers
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Keyboard shortcut 'F' to toggle fullscreen without ever clicking the media player
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;
            if (e.key.toLowerCase() === 'f') {
                e.preventDefault();
                void toggleFullscreen();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleFullscreen]);

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
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                containerRef={containerRef}
            />
            <div className="flex items-center justify-between px-4 md:px-8 py-2.5 bg-black/90 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium text-zinc-300">Server 1 (VidLink)</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Fullscreen button right in the UI bar so user never has to click the media player to enter/exit fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 active:bg-violet-700 rounded-md transition-colors shadow-sm"
                        title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
                        aria-label="Toggle Fullscreen"
                    >
                        {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
                        <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}</span>
                    </button>
                    <button
                        onClick={() => setReload(count => count + 1)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                        aria-label="Reload player"
                        title="Reload player"
                    >
                        <RefreshCw size={13} />
                        <span className="hidden sm:inline">Reload</span>
                    </button>
                </div>
            </div>
        </>
    );
}



