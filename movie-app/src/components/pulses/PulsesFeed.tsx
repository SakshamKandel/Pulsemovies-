'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Volume2, VolumeX, Info, Plus, Check, Play } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { Movie } from '@/lib/tmdb';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useWatchlistStore } from '@/store/useWatchlistStore';

interface PulsesFeedProps {
    initialMovies: Movie[];
}

export default function PulsesFeed({ initialMovies }: PulsesFeedProps) {
    const [movies, setMovies] = useState<Movie[]>(initialMovies);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    // Initial load check
    useEffect(() => {
        if (initialMovies.length === 0) return;
        setMovies(initialMovies);
    }, [initialMovies]);


    // Handle scroll snapping
    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const index = Math.round(container.scrollTop / container.clientHeight);

        if (index !== activeIndex && index >= 0 && index < movies.length) {
            setActiveIndex(index);
        }
    }, [activeIndex, movies.length]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    // Load more movies when reaching end (infinite scroll simulation for now)
    // For now we just loop or stop. The initial fetch is large (45 items).
    // We could duplicate the list to simulate infinite.

    return (
        <div
            ref={containerRef}
            className="h-[calc(100vh-4rem)] md:h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-hide"
        >
            {movies.map((movie, index) => (
                <div
                    key={`${movie.id}-${index}`}
                    className="h-full w-full snap-start relative flex items-center justify-center bg-black"
                >
                    <PulsesPlayer
                        movie={movie}
                        isActive={index === activeIndex}
                        shouldLoad={Math.abs(index - activeIndex) <= 1} // Only load current and adjacent
                        isMuted={isMuted}
                        toggleMute={() => setIsMuted(!isMuted)}
                    />
                </div>
            ))}
        </div>
    );
}

interface PulsesPlayerProps {
    movie: Movie;
    isActive: boolean;
    shouldLoad: boolean;
    isMuted: boolean;
    toggleMute: () => void;
}

function PulsesPlayer({ movie, isActive, shouldLoad, isMuted, toggleMute }: PulsesPlayerProps) {
    const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlistStore();
    const inWatchlist = isInWatchlist(movie.id);

    const toggleWatchlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (inWatchlist) {
            removeFromWatchlist(movie.id);
        } else {
            addToWatchlist(movie);
        }
    };

    if (!shouldLoad || !movie.video_key) {
        // Placeholder when not loaded
        return (
            <div className="relative w-full h-full md:w-[400px] md:aspect-[9/16]">
                <Image
                    src={getImageUrl(movie.poster_path, 'original', 'poster')}
                    alt={movie.title}
                    fill
                    className="object-cover opacity-50"
                    priority={isActive}
                />
            </div>
        );
    }

    return (
        <div className="relative w-full h-full md:w-full md:h-full bg-black overflow-hidden group">
            {/* Custom YouTube Player Wrapper */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <iframe
                    className="absolute w-[300%] h-[150%] md:w-[150%] md:h-[150%] object-cover pointer-events-none"
                    src={`https://www.youtube.com/embed/${movie.video_key}?autoplay=${isActive ? 1 : 0}&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${movie.video_key}&playsinline=1&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0`}
                    allow="autoplay; encrypted-media"
                    title={movie.title}
                    loading="lazy"
                />
            </div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none" />

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-30">
                <button
                    onClick={toggleWatchlist}
                    className="flex flex-col items-center gap-1 group/btn"
                >
                    <div className="w-12 h-12 bg-zinc-800/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group-hover/btn:bg-white group-hover/btn:text-black hover:scale-110">
                        {inWatchlist ? <Check className="w-6 h-6 text-green-500" /> : <Plus className="w-6 h-6" />}
                    </div>
                    <span className="text-xs font-medium drop-shadow-md">My List</span>
                </button>

                <button
                    onClick={toggleMute}
                    className="flex flex-col items-center gap-1 group/btn"
                >
                    <div className="w-12 h-12 bg-zinc-800/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group-hover/btn:bg-white group-hover/btn:text-black hover:scale-110">
                        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </div>
                    <span className="text-xs font-medium drop-shadow-md">{isMuted ? 'Muted' : 'Sound'}</span>
                </button>

                <Link href={`/movie/${movie.id}`} className="flex flex-col items-center gap-1 group/btn">
                    <div className="w-12 h-12 bg-zinc-800/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all group-hover/btn:bg-white group-hover/btn:text-black hover:scale-110">
                        <Info className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium drop-shadow-md">More</span>
                </Link>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-4 left-4 right-16 z-30 pointer-events-none">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 drop-shadow-lg">{movie.title}</h3>
                <p className="text-sm text-gray-200 line-clamp-2 drop-shadow-lg">{movie.overview}</p>
                <div className="flex gap-2 mt-2">
                    {movie.genre_ids?.slice(0, 3).map(id => (
                        <span key={id} className="text-[10px] bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                            Genre {id}
                        </span>
                    ))}
                </div>
            </div>

            {/* Click to Toggle Mute Layer */}
            <div
                className="absolute inset-0 z-20"
                onClick={toggleMute}
            />
        </div>
    );
}
