'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = React.useState(false);
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();

    const featuredMovies = movies.slice(0, 5);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-scroll logic (pauses on interaction)
    React.useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || featuredMovies.length <= 1) return;

        let scrollInterval: NodeJS.Timeout;

        const startAutoScroll = () => {
            scrollInterval = setInterval(() => {
                // If user is actively dragging, do not auto-scroll
                if (container.dataset.isDragging === 'true') return;

                const slideWidth = container.clientWidth;
                const currentScroll = container.scrollLeft;
                const maxScroll = container.scrollWidth - container.clientWidth;

                // If at end, wrap to start
                if (currentScroll >= maxScroll - 10) {
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    container.scrollTo({ left: currentScroll + slideWidth, behavior: 'smooth' });
                }
            }, 10000); // 10s delay
        };

        startAutoScroll();
        return () => clearInterval(scrollInterval);
    }, [featuredMovies.length]);

    // Drag / Scroll Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.dataset.isDragging = 'true';
        container.dataset.startX = e.pageX.toString();
        container.dataset.initialScroll = container.scrollLeft.toString();

        // Disable snap and set grabbing cursor for 1:1 control
        container.style.scrollSnapType = 'none';
        container.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const container = scrollContainerRef.current;
        if (!container || container.dataset.isDragging !== 'true') return;

        e.preventDefault();
        const currentX = e.pageX;
        const startX = parseFloat(container.dataset.startX || '0');
        const initialScroll = parseFloat(container.dataset.initialScroll || '0');

        // Calculate standard drag physics
        const walk = (startX - currentX) * 1; // 1:1 Natural control
        container.scrollLeft = initialScroll + walk;
    };

    const handleMouseUpOrLeave = (e: React.MouseEvent) => {
        const container = scrollContainerRef.current;
        if (!container || container.dataset.isDragging !== 'true') return;

        container.dataset.isDragging = 'false';
        container.style.cursor = 'grab';

        // Custom Snap Logic for "Little Swipe"
        const startX = parseFloat(container.dataset.startX || '0');
        const endX = e.pageX;
        const diff = startX - endX;
        const threshold = 50; // Small threshold for swipe

        if (Math.abs(diff) > threshold) {
            const direction = diff > 0 ? 1 : -1; // 1 = Next, -1 = Prev
            const slideWidth = container.clientWidth;
            const currentScroll = container.scrollLeft;
            const currentIndex = Math.round(currentScroll / slideWidth);

            // If we dragged enough to change, force it, otherwise stay/revert
            // Actually, if we dragged > 50px, we WANT to go to next/prev even if we didn't drag halfway.
            // But we must check bounds.

            let targetIndex = currentIndex;

            // If dragging RIGHT (diff > 0), simple logic:
            // If we passed the midpoint, snap takes over naturally to next.
            // If we didn't pass midpoint but passed threshold, we force next.
            // However, currentIndex is "current NEAREST".

            // Let's use strict current page floor/ceil
            const rawIndex = currentScroll / slideWidth;

            if (direction > 0) { // Swiping Left (Going Next)
                targetIndex = Math.ceil(rawIndex);
                if (targetIndex === Math.floor(rawIndex)) targetIndex += 1; // Already settled, move next
            } else { // Swiping Right (Going Prev)
                targetIndex = Math.floor(rawIndex);
                if (targetIndex === Math.ceil(rawIndex)) targetIndex -= 1;
            }

            // Clamp
            const maxIndex = featuredMovies.length - 1;
            targetIndex = Math.max(0, Math.min(targetIndex, maxIndex));

            container.scrollTo({
                left: targetIndex * slideWidth,
                behavior: 'smooth'
            });
        }

        // Re-enable snap after a short delay to allow smooth scroll to finish? 
        // Or immediately. If we set snap immediately, it might snap to nearest (which might be the one we are leaving if we didn't drag far enough).
        // BUT, we just called scrollTo.
        // Let's rely on native snap for "settling" if threshold wasn't met,
        // and manual scroll if it was.

        // Safety re-enable
        setTimeout(() => {
            if (container) container.style.scrollSnapType = 'x mandatory';
        }, 400); // Rough animation duration
    };

    if (featuredMovies.length === 0) return null;

    return (
        <div className={cn('relative w-full h-[75vh] min-h-[600px] bg-background group', className)}>
            <div
                ref={scrollContainerRef}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory hide-scrollbar cursor-grab"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
            >
                {featuredMovies.map((movie) => {
                    const backdropUrl = getImageUrl(movie.backdrop_path, 'original', 'backdrop');
                    const inWatchlist = mounted && isInWatchlist(movie.id);
                    const genres = movie.genre_ids.slice(0, 3).map(id => MOVIE_GENRES[id]).filter(Boolean);
                    const year = formatYear(movie.release_date);

                    return (
                        <div key={movie.id} className="relative min-w-full h-full snap-center flex-shrink-0">
                            {/* Image Layer */}
                            <div className="absolute inset-0 select-none">
                                <Image
                                    src={backdropUrl}
                                    alt={movie.title}
                                    fill
                                    priority
                                    className="object-cover object-top pointer-events-none"
                                    draggable={false}
                                />
                                {/* Overlays */}
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-90" />
                            </div>

                            {/* Content Grid */}
                            <div className="absolute inset-0 flex items-center z-10 pointer-events-none">
                                <div className="container mx-auto px-4 md:px-8 pointer-events-auto">
                                    <div className="max-w-2xl space-y-6 md:space-y-8">
                                        {/* Title Section */}
                                        <div className="space-y-4">
                                            {movie.images?.logos?.[0] ? (
                                                <div className="relative h-24 md:h-40 w-full max-w-[300px] md:max-w-md">
                                                    <Image
                                                        src={getImageUrl(movie.images.logos[0].file_path, 'original', 'logo')}
                                                        alt={movie.title}
                                                        fill
                                                        className="object-contain object-left pointer-events-none select-none"
                                                        priority
                                                        draggable={false}
                                                    />
                                                </div>
                                            ) : (
                                                <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] select-none">
                                                    {movie.title}
                                                </h1>
                                            )}
                                        </div>

                                        {/* Metadata */}
                                        <div className="flex flex-wrap items-center gap-3 select-none">
                                            <span className="px-2 py-1 bg-accent-primary text-white text-xs font-bold uppercase tracking-wider rounded-sm">
                                                Top Pick
                                            </span>
                                            <span className="text-white/80 font-medium">{year}</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-border" />
                                            <span className="text-accent-primary font-bold">★ {movie.vote_average.toFixed(1)}</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-border" />
                                            <div className="flex gap-2">
                                                {genres.map(g => (
                                                    <span key={g} className="text-text-secondary text-sm">{g}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-xl line-clamp-3 select-none">
                                            {truncateText(movie.overview, 220)}
                                        </p>

                                        {/* Buttons */}
                                        <div className="flex flex-wrap items-center gap-2 md:gap-4 pt-2">
                                            <Link href={`/movie/${movie.id}/watch`}>
                                                <button
                                                    className="flex items-center gap-2 px-4 md:px-8 py-3 md:py-4 bg-accent-primary hover:bg-accent-hover text-white font-bold text-sm md:text-base tracking-wide transition-colors rounded-sm shadow-flat select-none"
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                >
                                                    <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                                                    <span className="hidden sm:inline">WATCH NOW</span>
                                                    <span className="sm:hidden">PLAY</span>
                                                </button>
                                            </Link>

                                            <Link href={`/movie/${movie.id}`}>
                                                <button
                                                    className="flex items-center gap-2 px-4 md:px-8 py-3 md:py-4 bg-white/5 hover:bg-white/10 border-l-2 border-white/20 text-white font-semibold text-sm md:text-base transition-colors select-none"
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                >
                                                    <Info className="w-4 h-4 md:w-5 md:h-5" />
                                                    <span className="hidden sm:inline">DETAILS</span>
                                                    <span className="sm:hidden">INFO</span>
                                                </button>
                                            </Link>

                                            {mounted && (
                                                <button
                                                    onClick={() => isInWatchlist(movie.id) ? removeFromWatchlist(movie.id) : addToWatchlist(movie)}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    className={cn(
                                                        "flex items-center justify-center w-11 h-11 md:w-14 md:h-14 bg-background-card border border-border transition-colors hover:border-accent-primary",
                                                        mounted && isInWatchlist(movie.id) ? "text-accent-primary" : "text-text-secondary"
                                                    )}
                                                >
                                                    {mounted && isInWatchlist(movie.id) ? (
                                                        <Check className="w-5 h-5 md:w-6 md:h-6" />
                                                    ) : (
                                                        <Plus className="w-5 h-5 md:w-6 md:h-6" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
