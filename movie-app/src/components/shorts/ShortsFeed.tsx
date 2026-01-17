'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Play, Info, Volume2, VolumeX, Plus, Check, WifiOff, SignalLow } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, cn, formatYear } from '@/lib/utils';
import type { Movie } from '@/types/movie';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface ShortsFeedProps {
    initialMovies: Movie[];
}

export function ShortsFeed({ initialMovies }: ShortsFeedProps) {
    // Filter out movies without videos/backdrops to ensure high quality
    const validInitialMovies = React.useMemo(() =>
        initialMovies.filter(m => m.video_key || m.backdrop_path),
        [initialMovies]);

    const [movies, setMovies] = React.useState<Movie[]>(validInitialMovies);
    const [activeIndex, setActiveIndex] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [isMuted, setIsMuted] = React.useState(true);
    const { isOnline, effectiveType } = useNetworkStatus();

    // Scroll Handler & Infinite Loop Logic
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const index = Math.round(container.scrollTop / container.clientHeight);

        if (index !== activeIndex) {
            setActiveIndex(index);
        }

        // Infinite Scroll: Load more when nearing the end (last 3 items)
        if (index >= movies.length - 3) {
            // Append the initial batch again to create a loop
            setMovies(prev => [...prev, ...validInitialMovies]);
        }
    };

    // Navigate to specific index
    const navigateTo = React.useCallback((index: number) => {
        const container = containerRef.current;
        if (!container) return;

        const clampedIndex = Math.max(0, Math.min(index, movies.length - 1));
        container.scrollTo({
            top: clampedIndex * container.clientHeight,
            behavior: 'smooth'
        });
    }, [movies.length]);

    // Keyboard Navigation (Arrow Up/Down)
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if typing in an input
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            if (e.key === 'ArrowDown' || e.key === 'j') {
                e.preventDefault();
                navigateTo(activeIndex + 1);
            } else if (e.key === 'ArrowUp' || e.key === 'k') {
                e.preventDefault();
                navigateTo(activeIndex - 1);
            } else if (e.key === 'm') {
                // Toggle mute with 'm' key
                setIsMuted(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex, navigateTo]);

    if (validInitialMovies.length === 0) return null;

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar bg-zinc-950 z-0 cursor-grab active:cursor-grabbing"
            style={{ height: '100dvh' }}
            onScroll={handleScroll}
            onMouseDown={(e) => {
                const container = e.currentTarget;
                if (!container) return;

                container.dataset.isDragging = 'true';
                container.dataset.startY = e.pageY.toString();
                container.dataset.initialScroll = container.scrollTop.toString();

                // Disable snap for smooth 1:1 drag
                container.style.scrollSnapType = 'none';
                container.style.cursor = 'grabbing';
            }}
            onMouseMove={(e) => {
                const container = e.currentTarget;
                if (!container || container.dataset.isDragging !== 'true') return;

                e.preventDefault();
                const currentY = e.pageY;
                const startY = parseFloat(container.dataset.startY || '0');
                const initialScroll = parseFloat(container.dataset.initialScroll || '0');

                // 1:1 Drag Physics (Vertical)
                const walk = (startY - currentY) * 1;
                container.scrollTop = initialScroll + walk;
            }}
            onMouseUp={(e) => {
                const container = e.currentTarget;
                if (!container) return;

                container.dataset.isDragging = 'false';
                container.style.cursor = 'grab';

                // Custom Snap Logic
                const startY = parseFloat(container.dataset.startY || '0');
                const endY = e.pageY;
                const diff = startY - endY;
                const threshold = 50;

                if (Math.abs(diff) > threshold) {
                    const direction = diff > 0 ? 1 : -1; // 1 = Next, -1 = Prev
                    const slideHeight = container.clientHeight;
                    const currentScroll = container.scrollTop;
                    const rawIndex = currentScroll / slideHeight;

                    let targetIndex = Math.round(rawIndex);

                    if (direction > 0) { // Swiping Up (Going Next)
                        targetIndex = Math.ceil(rawIndex);
                        if (targetIndex === Math.floor(rawIndex)) targetIndex += 1;
                    } else { // Swiping Down (Going Prev)
                        targetIndex = Math.floor(rawIndex);
                        if (targetIndex === Math.ceil(rawIndex)) targetIndex -= 1;
                    }

                    // Clamp
                    const maxIndex = movies.length - 1;
                    targetIndex = Math.max(0, Math.min(targetIndex, maxIndex));

                    container.scrollTo({
                        top: targetIndex * slideHeight,
                        behavior: 'smooth'
                    });
                }

                // Restore snap after animation
                setTimeout(() => {
                    if (container) container.style.scrollSnapType = 'y mandatory';
                }, 400);
            }}
            onMouseLeave={(e) => {
                const container = e.currentTarget;
                if (container) {
                    container.dataset.isDragging = 'false';
                    container.style.cursor = 'grab';
                    container.style.scrollSnapType = 'y mandatory';
                }
            }}
        >
            {/* Navigation Arrows Overlay */}
            <div className="fixed inset-0 pointer-events-none z-50 flex flex-col justify-between items-center py-12 md:py-6">
                <div className={cn("transition-opacity duration-300 drop-shadow-md", activeIndex === 0 ? "opacity-0" : "opacity-75")}>
                    <ChevronUp className="w-10 h-10 text-white animate-bounce" />
                </div>
                <div className="opacity-75 drop-shadow-md">
                    <ChevronDown className="w-10 h-10 text-white animate-bounce" />
                </div>
            </div>

            {
                movies.map((movie, index) => (
                    <div
                        // Add index to key to allow duplicate movies in the infinite list
                        key={`${movie.id}-${index}`}
                        className="relative h-[100dvh] w-full snap-start flex items-center justify-center overflow-hidden bg-zinc-950"
                        style={{ height: '100dvh' }}
                    >
                        <ShortsPlayer
                            movie={movie}
                            isActive={index === activeIndex}
                            isMuted={isMuted}
                            toggleMute={() => setIsMuted(!isMuted)}
                            isOnline={isOnline}
                            connectionQuality={effectiveType}
                        />
                    </div>
                ))
            }
        </div >
    );
}

function ShortsPlayer({
    movie, isActive, isMuted, toggleMute, isOnline, connectionQuality
}: {
    movie: Movie, isActive: boolean, isMuted: boolean, toggleMute: () => void, isOnline: boolean, connectionQuality: string
}) {
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

    // Low bandwidth check (2g or 3g)
    const isLowBandwidth = connectionQuality === '2g' || connectionQuality === '3g';

    return (
        <div className="relative w-full h-full bg-black overflow-hidden group">
            {/* Background / Video Layer */}
            <div className="absolute inset-0 flex items-center justify-center">
                {!isOnline ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-white gap-4 z-40">
                        <WifiOff className="w-16 h-16 opacity-50" />
                        <p className="font-medium text-lg">No Internet Connection</p>
                        <Image
                            src={getImageUrl(movie.poster_path, 'original', 'poster')}
                            alt={movie.title}
                            fill
                            className="object-cover opacity-20 -z-10"
                        />
                    </div>
                ) : isActive && movie.video_key ? (
                    <div className="absolute inset-0 w-full h-full">
                        {/* Static Backdrop Blur while loading */}
                        <Image
                            src={getImageUrl(movie.poster_path, 'original', 'poster')}
                            alt={movie.title}
                            fill
                            className="object-cover blur-3xl opacity-50"
                            priority
                        />

                        <div className="absolute inset-0 bg-black/20" />

                        {/* Video Frame */}
                        <iframe
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[150%] md:w-[150%] md:h-[150%] object-cover pointer-events-none"
                            src={`https://www.youtube.com/embed/${movie.video_key}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&disablekb=1&fs=0&modestbranding=1&loop=1&playlist=${movie.video_key}&rel=0&showinfo=0&iv_load_policy=3&playsinline=1`}
                            allow="autoplay; encrypted-media"
                            title={movie.title}
                            loading={isLowBandwidth ? 'lazy' : 'eager'}
                        />

                        {/* Mute Toggle Layer */}
                        <div
                            className="absolute inset-0 z-10 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                        />
                    </div>
                ) : (
                    /* Fallback Image */
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

            {/* Seamless 2D Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none z-20" />

            {/* Connection Status Indicator */}
            {isOnline && isLowBandwidth && (
                <div className="absolute top-24 left-6 z-40 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-yellow-500/30 text-yellow-500 text-xs font-bold pointer-events-none">
                    <SignalLow className="w-3.5 h-3.5" />
                    <span>Low Data Mode</span>
                </div>
            )}

            {/* Top Logo / Navigation Area */}
            <div className="absolute top-0 left-0 right-0 p-6 pt-24 z-30 flex justify-between items-start pointer-events-none">
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

            {/* Bottom Content Area */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-24 md:pb-12 z-30 flex flex-col md:flex-row items-end justify-between gap-6 pointer-events-none">
                <div className="flex-1 space-y-4 max-w-2xl pointer-events-auto">
                    <div className="block md:hidden">
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-2 drop-shadow-lg leading-none">
                            {movie.title}
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white/90 text-xs font-bold rounded-sm border border-white/10">
                            {formatYear(movie.release_date)}
                        </span>
                        <span className="px-2 py-1 bg-accent-primary text-white text-xs font-bold rounded-sm">
                            ★ {movie.vote_average.toFixed(1)}
                        </span>
                    </div>

                    <p className="text-white/80 line-clamp-3 text-sm md:text-base leading-relaxed font-medium drop-shadow-md">
                        {movie.overview}
                    </p>

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
