'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl, truncateText, formatYear } from '@/lib/utils';
import { MOVIE_GENRES } from '@/lib/constants';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import type { Movie } from '@/types/movie';

interface HeroBannerProps {
    movies: Movie[];
    className?: string;
}

export function HeroBanner({ movies, className }: HeroBannerProps) {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [mounted, setMounted] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);

    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const featuredMovies = movies.slice(0, 5);
    const currentMovie = featuredMovies[currentIndex];

    // Drag / Swipe Logic
    const paginate = (newDirection: number) => {
        setCurrentIndex((prev) => (prev + newDirection + featuredMovies.length) % featuredMovies.length);
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    React.useEffect(() => {
        if (featuredMovies.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
        }, 10000);
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
        <div className={cn('relative w-full h-[75vh] min-h-[600px] overflow-hidden bg-background group', className)}>
            {/* Background Image Container with Sharp Cutoff */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMovie.id}
                    initial={{ opacity: 0, x: 100 }} // Slide effect
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);

                        if (swipe < -swipeConfidenceThreshold) {
                            paginate(1);
                        } else if (swipe > swipeConfidenceThreshold) {
                            paginate(-1);
                        }
                    }}
                >
                    {/* Image */}
                    <Image
                        src={backdropUrl}
                        alt={currentMovie.title}
                        fill
                        priority
                        className="object-cover object-top"
                    />
                    {/* Modern 2D Matte Overlay - Clean & Flat */}
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-90" />
                </motion.div>
            </AnimatePresence>

            {/* Content Grid */}
            <div className="absolute inset-0 flex items-center z-20 pointer-events-none">
                <div className="container mx-auto px-4 md:px-8 pointer-events-auto">
                    <div className="max-w-2xl space-y-6 md:space-y-8">
                        {/* Title Section */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`content-${currentMovie.id}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-4"
                            >
                                {currentMovie.images?.logos?.[0] ? (
                                    <div className="relative h-24 md:h-40 w-full max-w-[300px] md:max-w-md">
                                        <Image
                                            src={getImageUrl(currentMovie.images.logos[0].file_path, 'original', 'logo')}
                                            alt={currentMovie.title}
                                            fill
                                            className="object-contain object-left"
                                            priority
                                        />
                                    </div>
                                ) : (
                                    <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                                        {currentMovie.title}
                                    </h1>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Metadata Tags - Flat Style */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap items-center gap-3"
                        >
                            <span className="px-2 py-1 bg-accent-primary text-white text-xs font-bold uppercase tracking-wider rounded-sm">
                                Top Pick
                            </span>
                            <span className="text-white/80 font-medium">{year}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-border" />
                            <span className="text-accent-primary font-bold">★ {currentMovie.vote_average.toFixed(1)}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-border" />
                            <div className="flex gap-2">
                                {genres.map(g => (
                                    <span key={g} className="text-text-secondary text-sm">{g}</span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-text-secondary text-base md:text-lg leading-relaxed max-w-xl line-clamp-3"
                        >
                            {truncateText(currentMovie.overview, 220)}
                        </motion.p>

                        {/* Buttons - Modern 2D Flat */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-4 pt-2"
                        >
                            <Link href={`/movie/${currentMovie.id}/watch`}>
                                <button className="flex items-center gap-2 px-8 py-4 bg-accent-primary hover:bg-accent-hover text-white font-bold tracking-wide transition-colors rounded-sm shadow-flat">
                                    <Play className="w-5 h-5 fill-current" />
                                    WATCH NOW
                                </button>
                            </Link>

                            <Link href={`/movie/${currentMovie.id}`}>
                                <button className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border-l-2 border-white/20 text-white font-semibold transition-colors">
                                    <Info className="w-5 h-5" />
                                    DETAILS
                                </button>
                            </Link>

                            {mounted && (
                                <button
                                    onClick={handleWatchlistToggle}
                                    className={cn(
                                        "flex items-center justify-center w-14 h-14 bg-background-card border border-border transition-colors hover:border-accent-primary ml-2",
                                        inWatchlist ? "text-accent-primary" : "text-text-secondary"
                                    )}
                                >
                                    {inWatchlist ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        <Plus className="w-6 h-6" />
                                    )}
                                </button>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Draggable Trigger Area */}
            <div
                className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
            >
                {/* Invisible touch/drag surface */}
                <motion.div
                    className="w-full h-full"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={(e, { offset, velocity }) => {
                        setIsDragging(false);
                        const swipe = offset.x; // Negative = Left, Positive = Right
                        if (swipe < -100) {
                            // Swiped Left -> Next Slide
                            paginate(1);
                        } else if (swipe > 100) {
                            // Swiped Right -> Prev Slide
                            paginate(-1);
                        }
                    }}
                />
            </div>
        </div>
    );
}
