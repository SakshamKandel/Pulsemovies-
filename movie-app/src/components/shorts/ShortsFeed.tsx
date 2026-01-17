'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Play, Info, Volume2, VolumeX, Plus, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, cn, formatYear } from '@/lib/utils';
import type { Movie } from '@/types/movie';
import { useWatchlistStore } from '@/store/useWatchlistStore';

interface ShortsFeedProps {
    initialMovies: Movie[];
}

export function ShortsFeed({ initialMovies }: ShortsFeedProps) {
    // Filter out movies without videos/backdrops to ensure high quality
    const validMovies = React.useMemo(() =>
        initialMovies.filter(m => m.video_key || m.backdrop_path),
        [initialMovies]);

    const [activeIndex, setActiveIndex] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isMuted, setIsMuted] = React.useState(true);

    // Scroll Handler
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const index = Math.round(container.scrollTop / container.clientHeight);
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    const nextVideo = () => {
        if (activeIndex < validMovies.length - 1) {
            containerRef.current?.scrollTo({
                top: (activeIndex + 1) * window.innerHeight,
                behavior: 'smooth'
            });
        }
    };

    const prevVideo = () => {
        if (activeIndex > 0) {
            containerRef.current?.scrollTo({
                top: (activeIndex - 1) * window.innerHeight,
                behavior: 'smooth'
            });
        }
    };

    if (validMovies.length === 0) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 h-screen w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar bg-black z-0 cursor-grab active:cursor-grabbing"
            onScroll={handleScroll}
            onMouseDown={(e) => {
                const container = e.currentTarget;
                if (!container) return;
                // Store start position
                container.dataset.startY = e.clientY.toString();
                container.dataset.isDragging = 'true';
            }}
            onMouseMove={(e) => {
                // Optional: visual feedback (scrolling) if needed, but native scroll handles usage.
                // If we want "drag" to actually move the scroll, we need to manually scrollTop.
                // For "mouse to draggable", users expect the page to move with the mouse.
                // Since we have snap-y, we can just let user "throw" it?
                // But snap-y might fight manual scrollTop updates during drag.
                // Simplest robust solution for "mouse drag navigation":
                // Detect significant vertical swipe on MouseUp and trigger smooth scroll to next/prev.
                const container = e.currentTarget;
                if (container.dataset.isDragging === 'true') {
                    // e.preventDefault(); // Prevent text selection etc
                }
            }}
            onMouseUp={(e) => {
                const container = e.currentTarget;
                if (container.dataset.isDragging !== 'true') return;

                const startY = parseFloat(container.dataset.startY || '0');
                const diff = startY - e.clientY; // Positive = Drag Up (Next), Negative = Drag Down (Prev)
                const threshold = 100; // px to trigger change

                if (Math.abs(diff) > threshold) {
                    if (diff > 0) nextVideo();
                    else prevVideo();
                }

                container.dataset.isDragging = 'false';
            }}
            onMouseLeave={(e) => {
                // Cancel drag
                const container = e.currentTarget;
                container.dataset.isDragging = 'false';
            }}
        >
            {validMovies.map((movie, index) => (
                <div
                    key={movie.id}
                    className="relative h-screen w-full snap-start flex items-center justify-center overflow-hidden bg-black"
                >
                    <ShortsPlayer
                        movie={movie}
                        isActive={index === activeIndex}
                        isMuted={isMuted}
                        toggleMute={() => setIsMuted(!isMuted)}
                    />
                </div>
            ))}


        </div>
    );
}

function ShortsPlayer({ movie, isActive, isMuted, toggleMute }: { movie: Movie, isActive: boolean, isMuted: boolean, toggleMute: () => void }) {
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
    const [inWatchlist, setInWatchlist] = React.useState(false);

    React.useEffect(() => {
        setInWatchlist(isInWatchlist(movie.id));
    }, [isInWatchlist, movie.id]);

    const handleWatchlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (inWatchlist) removeFromWatchlist(movie.id);
        else addToWatchlist(movie);
    };

    return (
        <div className="relative w-full h-full bg-black overflow-hidden group">
            {/* Background / Video Layer */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* 
                    Seamless Video Integration: 
                    - Absolute Fill
                    - Scaled up (135%+) to hide YouTube controls/black bars
                    - Pointer events none to prevent direct YouTube interaction (pausing etc via their UI)
                 */}
                {isActive && movie.video_key ? (
                    <div className="absolute inset-0 w-full h-full">
                        {/* Static Backdrop Blur for loading/filling edges */}
                        <Image
                            src={getImageUrl(movie.poster_path, 'original', 'poster')}
                            alt={movie.title}
                            fill
                            className="object-cover blur-3xl opacity-50"
                            priority
                        />

                        <div className="absolute inset-0 bg-black/20" /> {/* Dimmer */}

                        <iframe
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[150%] md:w-[150%] md:h-[150%] object-cover pointer-events-none"
                            src={`https://www.youtube.com/embed/${movie.video_key}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&disablekb=1&fs=0&modestbranding=1&loop=1&playlist=${movie.video_key}&rel=0&showinfo=0&iv_load_policy=3&playsinline=1`}
                            allow="autoplay; encrypted-media"
                            title={movie.title}
                        />

                        {/* Mute Toggle Layer - Covers entire video area for simple click-to-mute */}
                        <div
                            className="absolute inset-0 z-10 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                        />
                    </div>
                ) : (
                    /* Fallback: High Quality Image with Ken Burns */
                    <div className="absolute inset-0">
                        <Image
                            src={getImageUrl(movie.poster_path, 'original', 'poster')}
                            alt={movie.title}
                            fill
                            className={cn(
                                "object-cover transition-transform duration-[20s] ease-linear",
                                isActive ? "scale-110" : "scale-100"
                            )}
                            priority={isActive}
                        />
                        <div className="absolute inset-0 bg-black/40" />
                    </div>
                )}
            </div>

            {/* Seamless 2D Overlays - Top & Bottom Fades */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none z-20" />

            {/* Top Logo / Navigation Area */}
            <div className="absolute top-0 left-0 right-0 p-6 pt-24 z-30 flex justify-between items-start pointer-events-none">
                {/* Logo if available or simple text */}
                <div className="flex flex-col items-start gap-2">
                    {movie.images?.logos?.[0] ? (
                        <div className="relative h-16 w-32 md:h-20 md:w-48">
                            <Image
                                src={getImageUrl(movie.images.logos[0].file_path, 'medium', 'logo')}
                                alt={movie.title}
                                fill
                                className="object-contain object-left drop-shadow-lg"
                            />
                        </div>
                    ) : (
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter drop-shadow-md opacity-0 md:opacity-100">
                            {movie.title}
                        </h2>
                    )}
                </div>

                <div className="pointer-events-auto">
                    <button
                        onClick={toggleMute}
                        className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white/90 border border-white/10 hover:bg-white/20 transition-colors"
                    >
                        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Bottom Content Area - TikTok Style Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-24 md:pb-12 z-30 flex flex-col md:flex-row items-end justify-between gap-6 pointer-events-none">
                <div className="flex-1 space-y-4 max-w-2xl pointer-events-auto">
                    {/* Title (Mobile mainly) */}
                    <div className="block md:hidden">
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-2 drop-shadow-lg leading-none">
                            {movie.title}
                        </h2>
                    </div>

                    {/* Metadata Pill */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white/90 text-xs font-bold rounded-sm border border-white/10">
                            {formatYear(movie.release_date)}
                        </span>
                        <span className="px-2 py-1 bg-accent-primary text-white text-xs font-bold rounded-sm">
                            ★ {movie.vote_average.toFixed(1)}
                        </span>
                    </div>

                    {/* Overview */}
                    <p className="text-white/80 line-clamp-3 text-sm md:text-base leading-relaxed font-medium drop-shadow-md">
                        {movie.overview}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                        <Link href={`/movie/${movie.id}/watch`} className="flex-1 md:flex-none">
                            <button className="w-full md:w-auto px-6 py-3.5 bg-white text-black hover:bg-white/90 font-bold rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg">
                                <Play className="w-5 h-5 fill-current" />
                                <span className="uppercase tracking-wide text-sm">Play Now</span>
                            </button>
                        </Link>

                        <button
                            onClick={handleWatchlist}
                            className="px-4 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-lg transition-colors flex items-center justify-center gap-2 hover:border-white/40"
                        >
                            {inWatchlist ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
