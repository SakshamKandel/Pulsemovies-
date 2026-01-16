'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

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
    // We'll primarily use VidSrc as it's generally reliable, but we can switch if needed.
    // For a cleaner UI as requested, we won't show the source buttons.

    // Switching to VidLink (often referred to as VidKing/VidBinge) for better quality and customization
    // Adding branding color to the player
    const primaryColor = 'b81d24'; // Netflix red var, or we can use our accent '#d946ef' (fuchsia-500)
    // Using our app's accent color (roughly)
    const accentColor = 'd946ef';

    const embedUrl = type === 'movie'
        ? `https://vidlink.pro/movie/${tmdbId}?primaryColor=${accentColor}&autoplay=false`
        : `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=${accentColor}&autoplay=false`;

    return (
        <div className={cn('relative w-full', className)}>
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            </div>
        </div>
    );
}
