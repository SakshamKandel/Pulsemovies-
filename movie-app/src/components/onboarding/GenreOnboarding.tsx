'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { getImageUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Hollywood Movies
const HOLLYWOOD_MOVIES = [
    { id: 27205, title: 'Inception', poster: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', genres: [28, 878, 53] },
    { id: 155, title: 'The Dark Knight', poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', genres: [18, 28, 80] },
    { id: 603, title: 'The Matrix', poster: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', genres: [28, 878] },
    { id: 120, title: 'LOTR: Fellowship', poster: '/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', genres: [12, 14, 28] },
    { id: 11, title: 'Star Wars', poster: '/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg', genres: [12, 28, 878] },
    { id: 299536, title: 'Avengers: Infinity War', poster: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', genres: [12, 28, 878] },
    { id: 278, title: 'Shawshank Redemption', poster: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg', genres: [18, 80] },
    { id: 238, title: 'The Godfather', poster: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', genres: [18, 80] },
    { id: 680, title: 'Pulp Fiction', poster: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', genres: [53, 80] },
    { id: 550, title: 'Fight Club', poster: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', genres: [18, 53] },
    { id: 157336, title: 'Interstellar', poster: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', genres: [12, 18, 878] },
    { id: 475557, title: 'Joker', poster: '/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', genres: [80, 18, 53] },
    { id: 13, title: 'Forrest Gump', poster: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', genres: [35, 18, 10749] },
    { id: 569094, title: 'Spider-Verse', poster: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', genres: [16, 28, 12] },
    { id: 129, title: 'Spirited Away', poster: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', genres: [16, 10751, 14] },
    { id: 694, title: 'The Shining', poster: '/nRj5511mZdTl4saWEPoj9QroTIu.jpg', genres: [27, 53] },
    { id: 597, title: 'Titanic', poster: '/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg', genres: [18, 10749] },
    { id: 807, title: 'Se7en', poster: '/6yoghtyTpznpBik8EngEmJskVUO.jpg', genres: [80, 9648, 53] },
    { id: 424, title: 'Schindler\'s List', poster: '/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg', genres: [18, 36, 10752] },
    { id: 335984, title: 'Blade Runner 2049', poster: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', genres: [878, 18] },
    { id: 496243, title: 'Parasite', poster: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', genres: [35, 18, 53] },
    { id: 98, title: 'Gladiator', poster: '/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg', genres: [28, 18, 12] },
    { id: 19995, title: 'Avatar', poster: '/kyeqWdyUXW608qlYkRqosgbbJyK.jpg', genres: [28, 12, 14, 878] },
    { id: 272, title: 'Batman Begins', poster: '/8RW2runSEc34IwKN2D1aPcJd2UL.jpg', genres: [28, 80, 18] },
];

// Hindi/Bollywood Movies
const HINDI_MOVIES = [
    { id: 20453, title: '3 Idiots', poster: '/66A9MqXOyVFCssoloscw79z8Tew.jpg', genres: [35, 18] },
    { id: 361743, title: 'Dangal', poster: '/fwEDzhilTpKlMXKJOaOoq1hgAr8.jpg', genres: [18, 28] },
    { id: 411088, title: 'Baahubali 2', poster: '/kZvTniBgpTzAThHCa20qVxO0IhA.jpg', genres: [28, 18] },
    { id: 297222, title: 'PK', poster: '/sBrGdYMdXigogHVtqlGwXBhSKWR.jpg', genres: [35, 18, 878] },
    { id: 475430, title: 'Gully Boy', poster: '/wDNrz05ZHYpEuVq2vmWlhgNW8MF.jpg', genres: [18, 10402] },
    { id: 458156, title: 'Andhadhun', poster: '/sABzERRqrmIaHSw6DUcpGCZHp1R.jpg', genres: [80, 53] },
    { id: 372733, title: 'Bajrangi Bhaijaan', poster: '/zKt2Wf8oMFsyqH2BQomJm8mJnFB.jpg', genres: [18, 35] },
    { id: 80389, title: 'Zindagi Na Milegi Dobara', poster: '/9KmxWKxnzNqNRcGR7qSahVMLPAH.jpg', genres: [12, 35, 18] },
    { id: 436969, title: 'Drishyam', poster: '/vXlZRw7Bl4sPt7pHcJN6IXQT2wN.jpg', genres: [80, 18, 53] },
    { id: 121986, title: 'Gangs of Wasseypur', poster: '/mONLBxoNBptv1JifZSqQKp4dM4S.jpg', genres: [28, 80, 18] },
    { id: 20916, title: 'Lagaan', poster: '/8GbJNiCNVVgWBvPu7xqdg4v6wG1.jpg', genres: [18, 10402] },
    { id: 28178, title: 'Dil Chahta Hai', poster: '/npbxGFt7HeBJUMVk4QFxH6tjy2e.jpg', genres: [35, 18, 10749] },
    { id: 15016, title: 'Rang De Basanti', poster: '/62UpLJHRwplDoKXm0Y8mHk4dhHf.jpg', genres: [18] },
    { id: 17979, title: 'Taare Zameen Par', poster: '/7J1rKnKZg6N0M4W6oZVkJl8M9qB.jpg', genres: [18] },
    { id: 301337, title: 'Queen', poster: '/pbQCwJaGzMY0dgxAqHrJ0lgQdYV.jpg', genres: [35, 18] },
    { id: 383498, title: 'Padmaavat', poster: '/n3zuzL31Z0v9CzqyL8aVKoKT1hh.jpg', genres: [18, 10749, 36] },
];

// Combine all movies
const SAMPLE_MOVIES = [...HOLLYWOOD_MOVIES, ...HINDI_MOVIES].filter(m => m.poster);

export function GenreOnboarding() {
    const {
        setFavoriteGenres,
        completeOnboarding,
        hasCompletedOnboarding
    } = usePreferencesStore();

    const [mounted, setMounted] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(false);
    const [selectedMovies, setSelectedMovies] = React.useState<number[]>([]);
    const [failedPosters, setFailedPosters] = React.useState<Set<number>>(new Set());

    React.useEffect(() => {
        setMounted(true);
        const timer = setTimeout(() => {
            if (!hasCompletedOnboarding) {
                setIsVisible(true);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [hasCompletedOnboarding]);

    const toggleMovie = (movieId: number) => {
        setSelectedMovies(prev =>
            prev.includes(movieId)
                ? prev.filter(id => id !== movieId)
                : [...prev, movieId]
        );
    };

    const handleImageError = (movieId: number) => {
        setFailedPosters(prev => new Set(prev).add(movieId));
    };

    const handleContinue = () => {
        const genres = new Set<number>();
        selectedMovies.forEach(movieId => {
            const movie = SAMPLE_MOVIES.find(m => m.id === movieId);
            movie?.genres.forEach(g => genres.add(g));
        });
        setFavoriteGenres(Array.from(genres));
        completeOnboarding();
        setIsVisible(false);
    };

    const handleSkip = () => {
        completeOnboarding();
        setIsVisible(false);
    };

    if (!mounted || hasCompletedOnboarding) return null;

    // Filter out movies with failed posters
    const visibleMovies = SAMPLE_MOVIES.filter(m => !failedPosters.has(m.id));

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col"
                >
                    {/* Header - Minimal */}
                    <div className="relative z-10 pt-6 pb-4 px-4 text-center bg-black">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xl md:text-2xl font-bold text-white"
                        >
                            What movies do you like?
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-text-muted text-xs mt-1"
                        >
                            Select at least 3 to personalize your experience
                        </motion.p>
                    </div>

                    {/* Movie Grid - Full screen, seamless */}
                    <div className="flex-1 overflow-y-auto pb-24 bg-black">
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-[2px]">
                            {visibleMovies.map((movie, index) => {
                                const isSelected = selectedMovies.includes(movie.id);
                                return (
                                    <motion.button
                                        key={movie.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.01 }}
                                        onClick={() => toggleMovie(movie.id)}
                                        className="relative aspect-[2/3] overflow-hidden bg-zinc-900"
                                    >
                                        <Image
                                            src={getImageUrl(movie.poster, 'medium', 'poster')}
                                            alt={movie.title}
                                            fill
                                            className={cn(
                                                "object-cover transition-all duration-200",
                                                isSelected ? "brightness-[0.3] scale-95" : "hover:brightness-75"
                                            )}
                                            onError={() => handleImageError(movie.id)}
                                        />

                                        {/* Check overlay */}
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-6 px-4">
                        <div className="max-w-sm mx-auto flex items-center gap-4">
                            <button
                                onClick={handleSkip}
                                className="px-4 py-3 text-text-muted hover:text-white transition-colors text-sm"
                            >
                                Skip
                            </button>

                            <button
                                onClick={handleContinue}
                                disabled={selectedMovies.length < 3}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
                                    selectedMovies.length >= 3
                                        ? "bg-accent-primary text-white"
                                        : "bg-white/10 text-text-muted cursor-not-allowed"
                                )}
                            >
                                {selectedMovies.length >= 3
                                    ? `Continue (${selectedMovies.length})`
                                    : `Pick ${3 - selectedMovies.length} more`
                                }
                                {selectedMovies.length >= 3 && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
