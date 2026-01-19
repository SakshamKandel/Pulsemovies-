'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Play, RefreshCw } from 'lucide-react';
import { useContinueWatchingStore } from '@/store/useContinueWatchingStore';
import { useProfile } from '@/context/ProfileContext';

// Server configuration - multiple embed providers
const SERVERS = [
    {
        id: 'vidking',
        name: 'Server 1',
        getUrl: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number, color?: string) => {
            const baseUrl = 'https://www.vidking.net/embed';
            const path = type === 'movie' ? `/movie/${tmdbId}` : `/tv/${tmdbId}/${season}/${episode}`;
            const params = new URLSearchParams({ color: color || 'd946ef', autoPlay: 'true' });
            if (type === 'tv') {
                params.append('nextEpisode', 'true');
                params.append('episodeSelector', 'true');
            }
            return `${baseUrl}${path}?${params.toString()}`;
        }
    },
    {
        id: 'vidsrc',
        name: 'Server 2',
        getUrl: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => {
            const baseUrl = 'https://vidsrc.cc/v2/embed';
            if (type === 'movie') {
                return `${baseUrl}/movie/${tmdbId}`;
            }
            return `${baseUrl}/tv/${tmdbId}/${season}/${episode}`;
        }
    },
    {
        id: 'videasy',
        name: 'Server 3',
        getUrl: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => {
            const baseUrl = 'https://player.videasy.net';
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
    posterPath?: string;
    description?: string; // Short description to display
}

export function PlayerEmbed({
    tmdbId,
    type,
    season = 1,
    episode = 1,
    className,
    movieTitle,
    posterPath,
    description,
}: PlayerEmbedProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);
    const [currentServerIndex, setCurrentServerIndex] = useState(0);
    const playerRef = useRef<HTMLIFrameElement>(null);
    const lastSaveRef = useRef<number>(0);

    const { addOrUpdate } = useContinueWatchingStore();
    const { currentProfile } = useProfile();

    // Accent color for VidKing
    const accentColor = 'd946ef';

    // Get current server URL
    const currentServer = SERVERS[currentServerIndex];
    const embedUrl = currentServer.getUrl(tmdbId, type, season, episode, accentColor);

    // Reset loading state when server changes
    useEffect(() => {
        setIsLoading(true);
        setHasError(false);
    }, [currentServerIndex]);

    // Handle incoming messages from player for progress tracking
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                if (data?.type === 'PLAYER_EVENT' && data?.data?.event === 'timeupdate') {
                    const { progress } = data.data;
                    if (progress > 1 && progress < 95 && movieTitle) {
                        const now = Date.now();
                        // Save every 15 seconds
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
            } catch (e) {
                // Ignore parse errors
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [movieTitle, tmdbId, type, season, episode, posterPath, addOrUpdate, currentProfile]);

    // Mobile detection
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

    const handleRetry = () => {
        setIsLoading(true);
        setHasError(false);
        // Force iframe reload by cycling key
        const nextIndex = (currentServerIndex + 1) % SERVERS.length;
        setCurrentServerIndex(nextIndex);
    };

    // Truncate description
    const shortDescription = description
        ? description.length > 120
            ? description.substring(0, 120).trim() + '...'
            : description
        : null;

    // Mobile: show play button overlay first
    if (isMobile && !showPlayer) {
        return (
            <div className={cn('relative w-full', className)}>
                <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <button
                        onClick={handlePlayClick}
                        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-accent-primary/90 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform shadow-lg shadow-accent-primary/30">
                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                        </div>
                        <span className="text-white text-base font-medium">Tap to Play</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('relative w-full', className)}>
            {/* Player Container */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
                {/* Loading State */}
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-3">
                        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
                        <span className="text-text-secondary text-sm">Loading player...</span>
                    </div>
                )}

                {/* Error State */}
                {hasError && !isLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-4">
                        <p className="text-text-secondary text-sm">Failed to load. Try another server.</p>
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Try Next Server</span>
                        </button>
                    </div>
                )}

                {/* Video Player Iframe with sandbox to block popups */}
                <iframe
                    key={`${currentServer.id}-${tmdbId}`}
                    ref={playerRef}
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    referrerPolicy="origin"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'manipulation'
                    }}
                />
            </div>

            {/* Server Selector - Minimalistic Design */}
            <div className="mt-4 flex flex-col gap-3">
                {/* Server Buttons */}
                <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 mr-2">Source:</span>
                    {SERVERS.map((server, index) => (
                        <button
                            key={server.id}
                            onClick={() => handleServerChange(index)}
                            className={cn(
                                'px-3 py-1.5 text-xs font-medium transition-all rounded',
                                currentServerIndex === index
                                    ? 'text-accent-primary border-b-2 border-accent-primary bg-accent-primary/5'
                                    : 'text-gray-400 hover:text-white'
                            )}
                        >
                            {server.name}
                        </button>
                    ))}
                </div>

                {/* Short Description */}
                {shortDescription && (
                    <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                        {shortDescription}
                    </p>
                )}
            </div>
        </div>
    );
}
