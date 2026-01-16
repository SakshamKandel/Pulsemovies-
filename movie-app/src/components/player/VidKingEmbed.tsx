'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Play } from 'lucide-react';

interface PlayerEmbedProps {
    tmdbId: number;
    type: 'movie' | 'tv';
    season?: number;
    episode?: number;
    className?: string;
}

export function PlayerEmbed({
    tmdbId,
    type,
    season = 1,
    episode = 1,
    className,
}: PlayerEmbedProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);

    // Using our app's accent color
    const accentColor = 'd946ef';

    const embedUrl = type === 'movie'
        ? `https://vidlink.pro/movie/${tmdbId}?primaryColor=${accentColor}&autoplay=true`
        : `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=${accentColor}&autoplay=true`;

    // On mobile, we show a play button first to ensure user interaction before loading iframe
    // This helps with mobile autoplay policies and loading issues
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    const handlePlayClick = () => {
        setShowPlayer(true);
    };

    // For mobile: show play button overlay first
    if (isMobile && !showPlayer) {
        return (
            <div className={cn('relative w-full', className)}>
                <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <button
                        onClick={handlePlayClick}
                        className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 group"
                    >
                        <div className="w-20 h-20 rounded-full bg-accent-primary/90 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform shadow-lg shadow-accent-primary/30">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                        <span className="text-white text-lg font-medium">Tap to Play</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('relative w-full', className)}>
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                {/* Loading State */}
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-3">
                        <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
                        <span className="text-text-secondary text-sm">Loading player...</span>
                    </div>
                )}

                {/* Video Player Iframe */}
                <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    referrerPolicy="origin"
                    onLoad={handleIframeLoad}
                    onError={() => setHasError(true)}
                    // Mobile-specific attributes
                    style={{
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'manipulation'
                    }}
                />
            </div>
        </div>
    );
}
