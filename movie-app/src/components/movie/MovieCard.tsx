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
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const inWatchlist = mounted && isInWatchlist(item.id);
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
            className="relative flex-shrink-0 w-[160px] md:w-[200px] group/card"
        >
            {/* Rank Number for Top 10 */}
            {showRank && (
                <div className="absolute -left-4 bottom-0 z-10 text-[100px] md:text-[120px] font-black text-white/5 drop-shadow-xl leading-none select-none">
                    {index + 1}
                </div>
            )}

            <Link href={href} className="block relative">
                {/* Card Container */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-background-card shadow-lg ring-1 ring-white/5 transition-all duration-300 group-hover/card:shadow-2xl group-hover/card:ring-white/20">
                    <Image
                        src={posterUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 160px, 200px"
                        className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                    />

                    {/* Gradient Overlay - Appears on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

                    {/* Rating Badge - Always Visible */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-4 group-hover/card:translate-y-0">

                        {/* Play Button - Centered in free space */}
                        <div className="absolute inset-0 flex items-center justify-center pb-12 pointer-events-none">
                            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform scale-0 group-hover/card:scale-100 transition-transform duration-300 delay-75">
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                            </div>
                        </div>

                        {/* Bottom Action Row */}
                        <div className="flex items-center gap-2 mt-auto z-10">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    router.push(watchHref);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-accent-primary text-white font-bold text-xs hover:bg-accent-hover transition-colors shadow-lg"
                            >
                                <Play className="w-3 h-3 fill-current" />
                                WATCH
                            </button>

                            <button
                                onClick={handleWatchlistToggle}
                                className={cn(
                                    "p-2 rounded-lg transition-colors border border-white/10 hover:bg-white/20",
                                    inWatchlist ? "bg-accent-secondary text-white border-accent-secondary" : "bg-black/40 text-white"
                                )}
                            >
                                {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={handleInfoClick}
                                className="p-2 rounded-lg bg-black/40 text-white border border-white/10 hover:bg-white/20 transition-colors"
                            >
                                <Info className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Title and Info */}
                <div className="mt-3 space-y-1 px-1">
                    <h3 className="text-white font-semibold text-sm line-clamp-1 group-hover/card:text-accent-primary transition-colors">
                        {title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span className="font-medium text-white/60">{year}</span>
                        {genres.length > 0 && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span className="line-clamp-1">{genres.join(', ')}</span>
                            </>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
