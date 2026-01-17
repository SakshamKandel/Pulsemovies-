'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Shuffle } from 'lucide-react';
import { useDiscoveryStore } from '@/store/useDiscoveryStore';
import { getImageUrl } from '@/lib/utils';
import type { Movie } from '@/types/movie';
import Link from 'next/link';
import Image from 'next/image';

interface RouletteModalProps {
    allMovies: Movie[];
}

export function RouletteModal({ allMovies }: RouletteModalProps) {
    const { isRouletteOpen, setRouletteOpen } = useDiscoveryStore();
    const [isSpinning, setIsSpinning] = React.useState(false);
    const [winner, setWinner] = React.useState<Movie | null>(null);
    const [displayMovie, setDisplayMovie] = React.useState<Movie | null>(null);

    const moviesWithPosters = React.useMemo(() => {
        return allMovies.filter(m => m.poster_path);
    }, [allMovies]);

    const previewMovies = React.useMemo(() => {
        const shuffled = [...moviesWithPosters].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 5);
    }, [moviesWithPosters]);

    React.useEffect(() => {
        if (isRouletteOpen) {
            setWinner(null);
            setIsSpinning(false);
            setDisplayMovie(null);
        }
    }, [isRouletteOpen]);

    const handleSpin = () => {
        if (moviesWithPosters.length === 0) return;

        setIsSpinning(true);
        setWinner(null);

        let count = 0;
        const interval = setInterval(() => {
            const idx = Math.floor(Math.random() * moviesWithPosters.length);
            setDisplayMovie(moviesWithPosters[idx]);
            count++;
            if (count > 15) {
                clearInterval(interval);
                const finalMovie = moviesWithPosters[Math.floor(Math.random() * moviesWithPosters.length)];
                setWinner(finalMovie);
                setDisplayMovie(finalMovie);
                setIsSpinning(false);
            }
        }, 150);
    };

    if (!isRouletteOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
                onClick={() => setRouletteOpen(false)}
            >
                {/* Close button - top right */}
                <button
                    onClick={() => setRouletteOpen(false)}
                    className="absolute top-6 right-6 p-2 text-text-muted hover:text-white transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Content - no box, just centered content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex flex-col items-center max-w-xl px-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    {!winner && !isSpinning && (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2">Can't Decide?</h2>
                            <p className="text-text-muted text-center mb-8">
                                We'll pick something from {moviesWithPosters.length}+ titles
                            </p>

                            {/* Movie Preview - horizontal scroll */}
                            <div className="flex gap-2 md:gap-3 mb-8 md:mb-10">
                                {previewMovies.map((movie) => (
                                    <div key={movie.id} className="relative w-16 md:w-24 aspect-[2/3] overflow-hidden opacity-70">
                                        <Image
                                            src={getImageUrl(movie.poster_path, 'small', 'poster')}
                                            alt={movie.title}
                                            fill
                                            sizes="(max-width: 768px) 64px, 96px"
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleSpin}
                                className="px-10 py-4 bg-accent-primary hover:bg-accent-hover text-white font-bold text-sm uppercase tracking-wider transition-colors flex items-center gap-3"
                            >
                                <Shuffle className="w-5 h-5" />
                                Pick For Me
                            </button>
                        </>
                    )}

                    {isSpinning && displayMovie && (
                        <>
                            <motion.div
                                key={displayMovie.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative w-52 aspect-[2/3] mb-6 overflow-hidden"
                            >
                                <Image
                                    src={getImageUrl(displayMovie.poster_path, 'medium', 'poster')}
                                    alt={displayMovie.title}
                                    fill
                                    sizes="208px"
                                    className="object-cover"
                                />
                            </motion.div>
                            <p className="text-text-muted text-sm uppercase tracking-widest animate-pulse">Picking...</p>
                        </>
                    )}

                    {winner && !isSpinning && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="relative w-56 aspect-[2/3] mb-6 overflow-hidden">
                                <Image
                                    src={getImageUrl(winner.poster_path, 'large', 'poster')}
                                    alt={winner.title}
                                    fill
                                    sizes="224px"
                                    className="object-cover"
                                />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2 text-center">{winner.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-text-muted mb-8">
                                <span className="text-accent-primary font-medium">★ {winner.vote_average.toFixed(1)}</span>
                                <span>{winner.release_date?.slice(0, 4)}</span>
                            </div>

                            <div className="flex gap-4">
                                <Link
                                    href={`/movie/${winner.id}/watch`}
                                    className="px-8 py-3 bg-accent-primary hover:bg-accent-hover text-white font-bold text-sm uppercase tracking-wider transition-colors flex items-center gap-2"
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                    Watch Now
                                </Link>
                                <button
                                    onClick={handleSpin}
                                    className="px-4 py-3 text-text-muted hover:text-accent-primary transition-colors"
                                    title="Pick again"
                                >
                                    <Shuffle className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
