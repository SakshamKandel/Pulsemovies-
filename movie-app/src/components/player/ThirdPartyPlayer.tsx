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
    const [isInteracting, setIsInteracting] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Handle mouse wheel over the media player to allow page scrolling
    const handleWheel = (e: React.WheelEvent) => {
        window.scrollBy({
            top: e.deltaY,
            left: e.deltaX,
            behavior: 'auto',
        });
    };

    // Unlock direct video interaction on click/tap, and re-enable scrolling on leave or inactivity
    const handlePointerDown = () => {
        setIsInteracting(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsInteracting(false);
        }, 4000);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsInteracting(false);
    };

    return (
        <div
            ref={containerRef}
            onMouseLeave={handleMouseLeave}
            className={`cinema-player-frame group relative w-full bg-black overflow-hidden select-none ${
                isFullscreen ? 'h-full flex items-center justify-center' : 'aspect-video'
            }`}
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

            {/* Transparent wheel-scroll layer: lets page scroll when mouse is over media player */}
            {!isFullscreen && (
                <div
                    onWheel={handleWheel}
                    onPointerDown={handlePointerDown}
                    className={`absolute inset-0 z-10 ${
                        isInteracting ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'
                    }`}
                    aria-hidden="true"
                />
            )}

            {/* Fullscreen toggle button: ALWAYS visible in fullscreen so the user can easily minimize */}
            <div
                className={`absolute top-4 right-4 z-40 transition-all duration-200 pointer-events-auto ${
                    isFullscreen
                        ? 'opacity-90 hover:opacity-100 scale-100'
                        : 'opacity-0 group-hover:opacity-100'
                }`}
            >
                <button
                    onClick={onToggleFullscreen}
                    className={`flex items-center justify-center rounded-xl bg-black/85 hover:bg-black text-white backdrop-blur-md border border-white/25 transition-all shadow-2xl hover:scale-105 active:scale-95 ${
                        isFullscreen
                            ? 'px-3.5 py-2 gap-2'
                            : 'w-9 h-9 sm:w-10 sm:h-10'
                    }`}
                    title={isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Fullscreen (F)'}
                    aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                    {isFullscreen ? (
                        <>
                            <Minimize className="w-4 h-4 text-violet-400" />
                            <span className="text-xs font-semibold tracking-wide text-white">Exit Fullscreen</span>
                        </>
                    ) : (
                        <Maximize className="w-5 h-5" />
                    )}
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
        try {
            if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
                if (containerRef.current) {
                    if (containerRef.current.requestFullscreen) {
                        await containerRef.current.requestFullscreen();
                    } else if ((containerRef.current as any).webkitRequestFullscreen) {
                        await (containerRef.current as any).webkitRequestFullscreen();
                    }
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
            setIsFullscreen(Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Keyboard shortcuts: 'F' or 'Escape' to toggle fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;
            if (e.key.toLowerCase() === 'f') {
                e.preventDefault();
                void toggleFullscreen();
            } else if (e.key === 'Escape' && (document.fullscreenElement || (document as any).webkitFullscreenElement)) {
                e.preventDefault();
                void toggleFullscreen();
            }
        };
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
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
            <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 md:px-8 py-2.5 bg-black/90 border-t border-white/5">
                {/* Fullscreen button in the UI bar */}
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
        </>
    );
}




