'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Plus, Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl, formatYear, getContentTitle, getContentDate } from '@/lib/utils';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import type { Movie, TVShow } from '@/types/movie';

interface MovieCardProps {
    item: Movie | TVShow;
    index?: number;
    showRank?: boolean;
}

export function MovieCard({ item, index = 0, showRank = false }: MovieCardProps) {
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
    const [mounted, setMounted] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    const inWatchlist = mounted && isInWatchlist(item.id);
    const isMovie = 'title' in item;
    const title = getContentTitle(item);
    const year = formatYear(getContentDate(item));
    const rating = item.vote_average;
    const posterUrl = getImageUrl(item.poster_path, 'medium', 'poster');
    const href = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;
    const watchHref = isMovie ? `/movie/${item.id}/watch` : `/tv/${item.id}/watch`;

    const handleWatchlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (inWatchlist) removeFromWatchlist(item.id);
        else addToWatchlist(item);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="flex-shrink-0 w-[150px] md:w-[180px] group/card relative"
        >
            {/* Rank Number */}
            {showRank && (
                <span className="absolute -left-6 bottom-4 text-8xl font-black text-white/5 md:text-white/[0.03] select-none z-0">
                    {index + 1}
                </span>
            )}

            {/* Card Image Container */}
            <div className="relative aspect-[2/3] bg-background-card rounded-xl overflow-hidden transition-all duration-300 z-10 box-decoration-clone">
                {!imageError ? (
                    <Image
                        src={posterUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 150px, 180px"
                        className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-background-card border border-white/5 p-4 text-center">
                        <span className="text-sm font-medium text-text-muted">{title}</span>
                    </div>
                )}

                {/* 2D Overlay - Solid Matte on Hover */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-4 p-4">
                    <Link href={watchHref} className="w-full">
                        <button className="w-full py-2.5 bg-accent-primary hover:bg-accent-hover text-white font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2">
                            <Play className="w-4 h-4 fill-current" />
                            PLAY
                        </button>
                    </Link>

                    <button
                        onClick={handleWatchlistToggle}
                        className={cn(
                            "w-full py-2.5 font-semibold text-sm transition-colors border flex items-center justify-center gap-2",
                            inWatchlist
                                ? "bg-transparent border-accent-secondary text-accent-secondary"
                                : "bg-transparent border-white/20 text-white hover:border-white"
                        )}
                    >
                        {inWatchlist ? (
                            <><Check className="w-4 h-4" /> ADDED</>
                        ) : (
                            <><Plus className="w-4 h-4" /> MY LIST</>
                        )}
                    </button>
                </div>

                {/* Rating Tag (Always visible until hover takes over) */}
                <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-accent-primary border border-white/10 group-hover/card:opacity-0 transition-opacity">
                    ★ {rating.toFixed(1)}
                </div>
            </div>

            {/* Simple Text Details */}
            <div className="mt-3 space-y-1">
                <Link href={href}>
                    <h3 className="text-white font-medium text-sm leading-tight line-clamp-1 group-hover/card:text-accent-primary transition-colors">
                        {title}
                    </h3>
                </Link>
                <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>{year}</span>
                    <span className="uppercase tracking-wider text-[10px] border border-border px-1 rounded-sm">
                        {isMovie ? 'Movie' : 'TV'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
