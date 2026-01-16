'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, Plus, Check, Star, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl, formatYear, getContentTitle, getContentDate } from '@/lib/utils';
import { MOVIE_GENRES } from '@/lib/constants';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import type { Movie, TVShow } from '@/types/movie';

interface MovieCardProps {
    item: Movie | TVShow;
    index?: number;
    showRank?: boolean;
}

export function MovieCard({ item, index = 0, showRank = false }: MovieCardProps) {
    const router = useRouter();
    const [isHovered, setIsHovered] = React.useState(false);
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();

    const inWatchlist = isInWatchlist(item.id);
    const isMovie = 'title' in item;
    const title = getContentTitle(item);
    const year = formatYear(getContentDate(item));
    const rating = item.vote_average;
    const posterUrl = getImageUrl(item.poster_path, 'medium', 'poster');
    const genres = item.genre_ids.slice(0, 2).map(id => MOVIE_GENRES[id]).filter(Boolean);

    const href = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;
    const watchHref = isMovie ? `/movie/${item.id}/watch` : `/tv/${item.id}/watch`;

    const handleWatchlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (inWatchlist) {
            removeFromWatchlist(item.id);
        } else {
            addToWatchlist(item);
        }
    };

    const handleWatchClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(watchHref);
    };

    const handleInfoClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(href);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="relative flex-shrink-0 w-[160px] md:w-[200px] group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Rank Number for Top 10 */}
            {showRank && (
                <div className="absolute -left-4 bottom-0 z-10 text-[120px] font-black text-text-muted/20 leading-none select-none">
                    {index + 1}
                </div>
            )}

            <Link href={href} className="block">
                {/* Poster */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-background-card">
                    <Image
                        src={posterUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 160px, 200px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium text-white">{rating.toFixed(1)}</span>
                    </div>

                    {/* Hover Actions - Using buttons instead of Links to avoid nesting */}
                    <motion.div
                        initial={false}
                        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
                        className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2 z-20"
                        style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
                    >
                        <button
                            onClick={handleWatchClick}
                            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-gradient-magenta text-white font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Watch
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={handleWatchlistToggle}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                                    inWatchlist
                                        ? 'bg-accent-primary text-white'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                )}
                            >
                                {inWatchlist ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                            </button>
                            <button
                                onClick={handleInfoClick}
                                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors cursor-pointer"
                            >
                                <Info className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Title and Info */}
                <div className="mt-3 space-y-1">
                    <h3 className="text-white font-medium text-sm line-clamp-1 group-hover:text-accent-primary transition-colors">
                        {title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span>{year}</span>
                        {genres.length > 0 && (
                            <>
                                <span>•</span>
                                <span className="line-clamp-1">{genres.join(', ')}</span>
                            </>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
