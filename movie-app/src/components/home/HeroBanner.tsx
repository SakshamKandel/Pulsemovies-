'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl, truncateText, formatYear } from '@/lib/utils';
import { MOVIE_GENRES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import type { Movie } from '@/types/movie';

interface HeroBannerProps {
    movies: Movie[];
    className?: string;
}

export function HeroBanner({ movies, className }: HeroBannerProps) {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [mounted, setMounted] = React.useState(false);

    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const featuredMovies = movies.slice(0, 5);
    const currentMovie = featuredMovies[currentIndex];

    // Auto-rotate featured movies
    React.useEffect(() => {
        if (featuredMovies.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
        }, 8000);

        return () => clearInterval(interval);
    }, [featuredMovies.length]);

    if (!currentMovie) return null;

    const backdropUrl = getImageUrl(currentMovie.backdrop_path, 'original', 'backdrop');
    const inWatchlist = mounted && isInWatchlist(currentMovie.id);
    const genres = currentMovie.genre_ids.slice(0, 3).map(id => MOVIE_GENRES[id]).filter(Boolean);
    const year = formatYear(currentMovie.release_date);

    const handleWatchlistToggle = () => {
        if (inWatchlist) {
            removeFromWatchlist(currentMovie.id);
        } else {
            addToWatchlist(currentMovie);
        }
    };

    return (
    return (
        <div className={cn('relative h-[65vh] md:h-[85vh] min-h-[550px] w-full overflow-hidden', className)}>
            {/* Background Image */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMovie.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    <Image
                        src={backdropUrl}
                        alt={currentMovie.title}
                        fill
                        priority
                        className="object-cover"
                    />
                </motion.div>
            </AnimatePresence>

            {/* Cinematic Gradient Overlays */}
            {/* Stronger bottom gradient for mobile text readability */}
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-background via-background/60 to-transparent md:hidden" />

            {/* Desktop gradients (Sidebar spotlight effect) */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
            <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

            {/* Content Container */}
            <div className="absolute inset-0 flex items-end mb-0">
                <div className="container mx-auto px-4 md:px-8 pb-20 md:pb-24">
                    <div className="max-w-xl md:max-w-2xl space-y-4 md:space-y-6 pr-12 md:pr-0">
                        {/* Title - Clean & Big */}
                        <AnimatePresence mode="wait">
                            {currentMovie.images?.logos?.[0] ? (
                                <motion.div
                                    key={`logo-${currentMovie.id}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative h-20 md:h-32 w-full max-w-[280px] md:max-w-sm"
                                >
                                    <Image
                                        src={getImageUrl(currentMovie.images.logos[0].file_path, 'original', 'logo')}
                                        alt={currentMovie.title}
                                        fill
                                        className="object-contain object-left"
                                        priority
                                    />
                                </motion.div>
                            ) : (
                                <motion.h1
                                    key={`title-${currentMovie.id}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-3xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-none"
                                >
                                    {currentMovie.title}
                                </motion.h1>
                            )}
                        </AnimatePresence>

                        {/* Metadata Pills */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`meta-${currentMovie.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-wrap items-center gap-2 md:gap-3"
                            >
                                <div className="flex items-center gap-2 px-2.5 py-0.5 md:px-3 md:py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full backdrop-blur-sm">
                                    <span className="text-yellow-400 text-xs md:text-sm font-bold">★ {currentMovie.vote_average.toFixed(1)}</span>
                                </div>
                                <div className="px-2.5 py-0.5 md:px-3 md:py-1 bg-white/10 border border-white/10 rounded-full backdrop-blur-sm">
                                    <span className="text-white text-xs md:text-sm font-medium">{year}</span>
                                </div>
                                {genres.map((genre, i) => (
                                    <div key={i} className="px-2.5 py-0.5 md:px-3 md:py-1 bg-white/5 border border-white/5 rounded-full backdrop-blur-sm">
                                        <span className="text-gray-200 text-[10px] md:text-xs font-medium">{genre}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {/* Overview - Constrained width */}
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={`desc-${currentMovie.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-gray-300 text-sm md:text-lg leading-relaxed line-clamp-3 md:line-clamp-4 max-w-lg hidden md:block"
                            >
                                {truncateText(currentMovie.overview, 200)}
                            </motion.p>
                            {/* Mobile short overview */}
                            <motion.p
                                key={`desc-mobile-${currentMovie.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-gray-300 text-sm leading-relaxed line-clamp-2 md:hidden"
                            >
                                {truncateText(currentMovie.overview, 100)}
                            </motion.p>
                        </AnimatePresence>

                        {/* Cineby Style Buttons */}
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-2">
                            <Link href={`/movie/${currentMovie.id}/watch`}>
                                <button className="flex items-center gap-2 px-6 py-2.5 md:px-8 md:py-3 bg-white text-black rounded-lg font-bold text-sm md:text-base hover:bg-gray-200 transition-colors active:scale-95">
                                    <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                                    <span>Play</span>
                                </button>
                            </Link>

                            <Link href={`/movie/${currentMovie.id}`}>
                                <button className="flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-white/10 border border-white/20 backdrop-blur-md text-white rounded-lg font-medium text-sm md:text-base hover:bg-white/20 transition-colors active:scale-95">
                                    <Info className="w-4 h-4 md:w-5 md:h-5" />
                                    <span>See More</span>
                                </button>
                            </Link>

                            {/* Watchlist Toggle - Minimalist Circle */}
                            {mounted && (
                                <button
                                    onClick={handleWatchlistToggle}
                                    className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 transition-colors active:scale-95"
                                >
                                    {inWatchlist ? (
                                        <Check className="w-4 h-4 md:w-5 md:h-5" />
                                    ) : (
                                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Carousel Indicators - Refined & Hidden on Mobile */}
            {featuredMovies.length > 1 && (
                <div className="hidden md:flex absolute right-8 bottom-1/3 flex-col gap-3">
                    {featuredMovies.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                'w-1.5 h-1.5 rounded-full transition-all duration-300',
                                index === currentIndex
                                    ? 'h-8 bg-accent-primary'
                                    : 'bg-white/50 hover:bg-white'
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
