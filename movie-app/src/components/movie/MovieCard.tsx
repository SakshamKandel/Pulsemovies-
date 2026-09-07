'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getMovieTrailerKey } from '@/lib/tmdb';
import { Plus, Check, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl, formatYear, getContentTitle, getContentDate } from '@/lib/utils';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import { useProfile } from '@/context/ProfileContext';
import type { Movie, TVShow, MovieDetails, TVShowDetails } from '@/types/movie';

type ContentItem = Movie | TVShow | MovieDetails | TVShowDetails;

interface MovieCardProps {
    item: ContentItem & { addedAt?: number };
    index?: number;
    showRank?: boolean;
}

export function MovieCard({ item, index = 0, showRank = false }: MovieCardProps) {
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
    const { currentProfile } = useProfile();
    const [previewKey, setPreviewKey] = React.useState<string | null>(null);
    const previewVersion = React.useRef(0);
    const hoverTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const stopPreview = React.useCallback(() => {
        previewVersion.current++;
        if (hoverTimer.current) clearTimeout(hoverTimer.current);
        setPreviewKey(null);
    }, []);
    const startPreview = (event: React.PointerEvent) => {
        if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        stopPreview();
        const version = previewVersion.current;
        hoverTimer.current = setTimeout(async () => {
            const key = await getMovieTrailerKey(item.id, 'title' in item ? 'movie' : 'tv');
            if (version === previewVersion.current) setPreviewKey(key);
        }, 700);
    };
    React.useEffect(() => {
        const onVisibility = () => { if (document.hidden) stopPreview(); };
        if (previewKey) document.addEventListener('visibilitychange', onVisibility);
        if (previewKey) window.addEventListener('scroll', stopPreview, true);
        return () => {
            previewVersion.current++;
            if (hoverTimer.current) clearTimeout(hoverTimer.current);
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('scroll', stopPreview, true);
        };
    }, [stopPreview, previewKey]);
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

    const handleWatchlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (inWatchlist) removeFromWatchlist(item.id, currentProfile?.id);
        else addToWatchlist(item, currentProfile?.id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.3 }}
            onPointerEnter={startPreview} onPointerLeave={stopPreview}
            className="movie-card flex-shrink-0 w-[150px] md:w-[180px] group/card relative"
        >
            {/* Rank Number */}
            {showRank && (
                <span className="absolute -left-6 bottom-4 text-8xl font-black text-white/5 md:text-white/[0.03] select-none z-0">
                    {index + 1}
                </span>
            )}

            {/* Card Image Container - Link to detail page */}
            <Link href={`${href}/watch`} prefetch={false} aria-label={`Watch ${title}`} className="block relative aspect-[2/3] bg-background-card rounded-xl overflow-hidden transition-all duration-300 z-10">
                {!imageError && item.poster_path ? (
                    <Image
                        src={posterUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 150px, 180px"
                        className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800 border border-white/5 p-4 text-center gap-2">
                        {isMovie ? (
                            <div className="text-4xl">🎬</div>
                        ) : (
                            <div className="text-4xl">📺</div>
                        )}
                        <span className="text-xs font-medium text-text-muted line-clamp-3">{title}</span>
                    </div>
                )}

                {previewKey && <div className="absolute inset-0 bg-black pointer-events-none"><iframe title={`${title} trailer preview`} src={`https://www.youtube.com/embed/${previewKey}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0`} className="absolute inset-0 w-full h-full" allow="autoplay; encrypted-media" referrerPolicy="strict-origin-when-cross-origin" tabIndex={-1} /><span className="absolute bottom-3 left-3 text-[10px] text-white/70">TRAILER PREVIEW</span></div>}
                {/* Rating Tag */}
                <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-accent-primary border border-white/10 group-hover/card:opacity-0 transition-opacity">
                    ★ {rating.toFixed(1)}
                </div>
            </Link>

            <div className="card-actions flex items-center gap-1 mt-2">
                <Link href={`${href}/watch`} prefetch={false} onClick={stopPreview} className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs rounded-lg bg-white/5 hover:bg-violet-500/20 text-zinc-300" aria-label={`Watch ${title}`}><Play size={13} /> Watch now</Link>
                <button onClick={handleWatchlistToggle} aria-label={`${inWatchlist ? 'Remove' : 'Save'} ${title} ${inWatchlist ? 'from' : 'to'} My List`} aria-pressed={inWatchlist} className={cn('icon-control', inWatchlist && 'text-violet-300 bg-violet-500/15')}>
                    {inWatchlist ? <Check size={16} /> : <Plus size={16} />}
                </button>
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
