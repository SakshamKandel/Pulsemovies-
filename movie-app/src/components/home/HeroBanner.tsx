'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Plus, Check, Volume2, VolumeX } from 'lucide-react';
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
    const [isMuted, setIsMuted] = React.useState(true);
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();

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
    const inWatchlist = isInWatchlist(currentMovie.id);
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
        <div className={cn('relative h-[65vh] min-h-[500px] w-full overflow-hidden pt-16', className)}>
            {/* Background Image */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMovie.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1 }}
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

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />

            {/* Content */}
            <div className="absolute inset-0 flex items-end pb-12 md:pb-24">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="max-w-2xl space-y-4">
                        {/* Title */}
                        <AnimatePresence mode="wait">
                            {currentMovie.images?.logos?.[0] ? (
                                <motion.div
                                    key={`logo-${currentMovie.id}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative h-12 md:h-20 lg:h-24 w-full max-w-sm mb-2"
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
                                    className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                                >
                                    {currentMovie.title}
                                </motion.h1>
                            )}
                        </AnimatePresence>

                        {/* Meta Info */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`meta-${currentMovie.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-wrap items-center gap-3 text-sm text-text-secondary"
                            >
                                <span className="px-2 py-1 bg-accent-primary text-white text-sm font-medium rounded">
                                    ★ {currentMovie.vote_average.toFixed(1)}
                                </span>
                                <span>{year}</span>
                                <span className="hidden md:inline">•</span>
                                <span className="hidden md:inline">{genres.join(' • ')}</span>
                            </motion.div>
                        </AnimatePresence>

                        {/* Overview */}
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={`desc-${currentMovie.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-text-secondary text-base leading-normal line-clamp-3"
                            >
                                {truncateText(currentMovie.overview, 250)}
                            </motion.p>
                        </AnimatePresence>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Link href={`/movie/${currentMovie.id}/watch`}>
                                <Button
                                    variant="primary"
                                    size="md"
                                    leftIcon={<Play className="w-5 h-5 fill-current" />}
                                >
                                    Watch Now
                                </Button>
                            </Link>
                            <Link href={`/movie/${currentMovie.id}`}>
                                <Button
                                    variant="secondary"
                                    size="md"
                                    leftIcon={<Info className="w-5 h-5" />}
                                >
                                    More Info
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleWatchlistToggle}
                                className="w-12 h-12 rounded-full border border-border"
                            >
                                {inWatchlist ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <Plus className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Carousel Indicators */}
            {
                featuredMovies.length > 1 && (
                    <div className="absolute bottom-8 right-8 flex items-center gap-4">
                        {/* Mute Button */}
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-3 rounded-full border border-white/30 text-white/70 hover:text-white hover:border-white transition-colors"
                        >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>

                        {/* Dots */}
                        <div className="flex gap-2">
                            {featuredMovies.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={cn(
                                        'w-12 h-1 rounded-full transition-all duration-300',
                                        index === currentIndex
                                            ? 'bg-accent-primary'
                                            : 'bg-white/30 hover:bg-white/50'
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )
            }

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </div >
    );
}
