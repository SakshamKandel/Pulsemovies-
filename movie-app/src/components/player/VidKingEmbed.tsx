'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Play, RefreshCw, Tv, Wifi, Zap, MonitorPlay } from 'lucide-react';
import { useContinueWatchingStore } from '@/store/useContinueWatchingStore';
import { useProfile } from '@/context/ProfileContext';

// Curated high-speed streaming sources
const SERVERS = [
    {
        id: 'vidlink',
        name: 'Server 1',
        tag: 'Fast',
        badge: '1080p HD',
        getUrl: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => {
            const baseUrl = 'https://vidlink.pro';
            const path = type === 'movie' ? `/movie/${tmdbId}` : `/tv/${tmdbId}/${season}/${episode}`;
            return `${baseUrl}${path}?primaryColor=d946ef&autoplay=true`;
        }
    },
    {
        id: 'videasy',
        name: 'Server 2',
        tag: 'Clean',
        badge: 'Direct',
        getUrl: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => {
            const baseUrl = 'https://player.videasy.net';
            if (type === 'movie') {
                return `${baseUrl}/movie/${tmdbId}`;
            }
            return `${baseUrl}/tv/${tmdbId}/${season}/${episode}`;
        }
    },
    {
        id: 'rivestream',
        name: 'Server 3',
        tag: 'HD',
        badge: 'Multi-Res',
        getUrl: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => {
            if (type === 'movie') {
                return `https://rivestream.live/embed?type=movie&id=${tmdbId}`;
            }
            return `https://rivestream.live/embed?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`;
        }
    },
    {
        id: 'autoembed',
        name: 'Server 4',
        tag: 'Auto',
        badge: 'Mirror',
        getUrl: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => {
            if (type === 'movie') {
                return `https://autoembed.to/movie/tmdb/${tmdbId}`;
            }
            return `https://autoembed.to/tv/tmdb/${tmdbId}/${season}/${episode}`;
        }
    },
    {
        id: 'vidsrc',
        name: 'Server 5',
        tag: 'Backup',
        badge: 'Archive',
        getUrl: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => {
            const baseUrl = 'https://vidsrc.to/embed';
            if (type === 'movie') {
                return `${baseUrl}/movie/${tmdbId}`;
            }
            return `${baseUrl}/tv/${tmdbId}/${season}/${episode}`;
        }
    }
];

interface PlayerEmbedProps {
    tmdbId: number;
    type: 'movie' | 'tv';
    season?: number;
    episode?: number;
    className?: string;
    movieTitle?: string;
    posterPath?: string | null;
}

export function PlayerEmbed({
    tmdbId,
    type,
    season = 1,
    episode = 1,
    className,
    movieTitle,
    posterPath,
}: PlayerEmbedProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);
    const [currentServerIndex, setCurrentServerIndex] = useState(0);
    const playerRef = useRef<HTMLIFrameElement>(null);
    const lastSaveRef = useRef<number>(0);

    const { addOrUpdate } = useContinueWatchingStore();
    const { currentProfile } = useProfile();

    // Anti-redirect & anti-popup deflector for parent window
    useEffect(() => {
        // Prevent parent window pop-ups without breaking the iframe player
        const originalOpen = window.open;
        window.open = function () {
            console.log('[Pulse Guard] Blocked parent popup redirect');
            return null;
        };

        // Regain focus if a popup steals focus momentarily
        const handleBlur = () => {
            setTimeout(() => {
                window.focus();
            }, 100);
        };
        window.addEventListener('blur', handleBlur);

        return () => {
            window.open = originalOpen;
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    // Active server URL
    const currentServer = SERVERS[currentServerIndex];
    const embedUrl = currentServer.getUrl(tmdbId, type, season, episode);

    // Reset loading state on server switch
    useEffect(() => {
        setIsLoading(true);
        setHasError(false);
    }, [currentServerIndex]);

    // Track continue-watching progress
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                if (data?.type === 'PLAYER_EVENT' && data?.data?.event === 'timeupdate') {
                    const { progress } = data.data;
                    if (progress > 1 && progress < 95 && movieTitle) {
                        const now = Date.now();
                        if (now - lastSaveRef.current > 15000) {
                            const item = {
                                id: tmdbId,
                                title: movieTitle,
                                name: movieTitle,
                                poster_path: posterPath,
                                media_type: type,
                                vote_average: 0
                            };
                            addOrUpdate(item as any, progress, currentProfile?.id, season, episode);
                            lastSaveRef.current = now;
                        }
                    }
                }
            } catch {
                // Ignore parse errors
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [movieTitle, tmdbId, type, season, episode, posterPath, addOrUpdate, currentProfile]);

    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    const handleIframeError = () => {
        setHasError(true);
        setIsLoading(false);
    };

    const handlePlayClick = () => {
        setShowPlayer(true);
    };

    const handleServerChange = (index: number) => {
        if (index !== currentServerIndex) {
            setCurrentServerIndex(index);
        }
    };

    const handleReload = () => {
        setIsLoading(true);
        setHasError(false);
        if (playerRef.current) {
            playerRef.current.src = embedUrl;
        }
    };

    // Mobile initial poster tap
    if (isMobile && !showPlayer) {
        return (
            <div className={cn('relative w-full', className)}>
                <div className="cinema-player-frame relative aspect-video bg-black overflow-hidden">
                    <button
                        onClick={handlePlayClick}
                        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-accent-primary flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform shadow-lg shadow-accent-primary/30">
                            <Play className="w-7 h-7 text-white fill-white ml-1" />
                        </div>
                        <span className="text-white text-base font-medium">Tap to Play</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('cinema-player relative w-full group', className)}>
            {/* Ambient Ambient Glow */}


            {/* Video Player Screen */}
            <div className="cinema-player-frame relative aspect-video w-full bg-black overflow-hidden z-10">
                {/* Loading State */}
                {isLoading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm gap-3">
                        <Loader2 className="w-9 h-9 text-accent-primary animate-spin" />
                        <span className="text-zinc-400 text-sm font-medium tracking-wide">Connecting to HD stream...</span>
                    </div>
                )}

                {/* Error Fallback */}
                {hasError && !isLoading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 gap-4 p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                            <Wifi className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-white font-medium text-sm">Stream unavailable on this server</p>
                            <p className="text-zinc-500 text-xs mt-1">Please select another server below</p>
                        </div>
                        <button
                            onClick={() => handleServerChange((currentServerIndex + 1) % SERVERS.length)}
                            className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-accent-primary/20"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Try Server {((currentServerIndex + 1) % SERVERS.length) + 1}</span>
                        </button>
                    </div>
                )}

                {/* Main Video Iframe - NO sandbox attribute to allow smooth playback without provider errors */}
                <iframe
                    key={`${currentServer.id}-${tmdbId}`}
                    ref={playerRef}
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    referrerPolicy="origin"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'manipulation'
                    }}
                />
            </div>

            {/* Modern Streaming Console / Bar */}
            <div className="player-sources relative z-10 bg-black px-4 md:px-8 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Left: Server Switcher Tabs */}
                <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-1.5 mr-1 text-zinc-400">
                        <MonitorPlay className="w-4 h-4 text-accent-primary" />
                        <span className="text-xs font-medium text-zinc-300 hidden md:inline">Server:</span>
                    </div>

                    {SERVERS.map((server, index) => {
                        const isActive = currentServerIndex === index;
                        return (
                            <button
                                key={server.id}
                                aria-pressed={isActive}
                                onClick={() => handleServerChange(index)}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1 text-xs font-medium transition-colors border-b-2',
                                    isActive
                                        ? 'text-white border-violet-400'
                                        : 'text-zinc-500 border-transparent hover:text-white'
                                )}
                            >
                                <span className={cn(
                                    'w-1.5 h-1.5 rounded-full',
                                    isActive ? 'bg-white' : 'bg-emerald-400'
                                )} />
                                <span>{server.name}</span>
                                <span className={cn(
                                    'hidden lg:inline text-[9px] px-1 font-semibold uppercase tracking-wider',
                                    isActive ? 'bg-white/20 text-white' : 'bg-white/[0.05] text-zinc-400'
                                )}>
                                    {server.tag}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Right: Status & Quick Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>{currentServer.badge}</span>
                    </div>

                    <button
                        onClick={handleReload}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                        title="Reload stream"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reload</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
