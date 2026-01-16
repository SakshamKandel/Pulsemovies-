'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, Film, Tv, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { searchMulti } from '@/lib/tmdb';
import { getImageUrl, getContentTitle, isMovie } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';
import { MOVIE_GENRES, TV_GENRES } from '@/lib/constants';
import type { Movie, TVShow, Person } from '@/types/movie';
import Image from 'next/image';
import Link from 'next/link';

const QUICK_GENRES = [
    { id: 28, name: 'Action', icon: '🎬' },
    { id: 35, name: 'Comedy', icon: '😂' },
    { id: 18, name: 'Drama', icon: '🎭' },
    { id: 27, name: 'Horror', icon: '👻' },
    { id: 878, name: 'Sci-Fi', icon: '🚀' },
    { id: 10749, name: 'Romance', icon: '💕' },
];

export function SearchBar() {
    const router = useRouter();
    const { setSearchOpen } = useUIStore();
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<(Movie | TVShow)[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showResults, setShowResults] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const debounceRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

    // Focus input on mount
    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Debounced search
    React.useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.trim().length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }

        setIsLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const data = await searchMulti(query);
                // Filter out people and limit to 8 results
                const filtered = data.results
                    .filter((item): item is Movie | TVShow => item.media_type !== 'person')
                    .slice(0, 8);
                setResults(filtered);
                setShowResults(true);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setSearchOpen(false);
        }
    };

    const handleResultClick = () => {
        setSearchOpen(false);
        setQuery('');
        setResults([]);
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        inputRef.current?.focus();
    };

    const handleGenreClick = (genreId: number) => {
        router.push(`/browse/movies?genre=${genreId}`);
        setSearchOpen(false);
    };

    return (
        <div className="relative w-full max-w-3xl mx-auto">
            {/* Search Input - Premium Design */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-primary" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for movies, TV shows, genres..."
                        className={cn(
                            'w-full h-14 pl-14 pr-14 rounded-2xl',
                            'bg-background-secondary/80 backdrop-blur-sm',
                            'border-2 border-border hover:border-accent-primary/30',
                            'text-white text-lg placeholder:text-text-muted',
                            'focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10',
                            'transition-all duration-300'
                        )}
                    />

                    {/* Loading/Clear Button */}
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
                        ) : query && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="p-1.5 rounded-full bg-background-card hover:bg-accent-primary/20 transition-colors"
                            >
                                <X className="w-4 h-4 text-text-muted" />
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {/* Quick Genre Pills - Show when no query */}
            <AnimatePresence>
                {!query && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 flex flex-wrap justify-center gap-2"
                    >
                        {QUICK_GENRES.map((genre) => (
                            <button
                                key={genre.id}
                                onClick={() => handleGenreClick(genre.id)}
                                className="px-4 py-2 rounded-full bg-background-card border border-border text-sm text-text-secondary hover:text-white hover:border-accent-primary/50 hover:bg-accent-primary/10 transition-all"
                            >
                                {genre.name}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Results Dropdown */}
            <AnimatePresence>
                {showResults && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        className="absolute top-full left-0 right-0 mt-3 bg-background-card/95 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-2xl z-50"
                    >
                        <div className="p-2">
                            {results.map((item, index) => {
                                const title = getContentTitle(item);
                                const isMovieItem = isMovie(item);
                                const href = isMovieItem ? `/movie/${item.id}` : `/tv/${item.id}`;
                                const posterUrl = getImageUrl(item.poster_path, 'small', 'poster');
                                const year = isMovieItem
                                    ? (item as Movie).release_date?.slice(0, 4)
                                    : (item as TVShow).first_air_date?.slice(0, 4);

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <Link
                                            href={href}
                                            onClick={handleResultClick}
                                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent-primary/10 transition-colors group"
                                        >
                                            {/* Poster */}
                                            <div className="relative w-14 h-20 rounded-lg overflow-hidden bg-background-secondary flex-shrink-0">
                                                {item.poster_path ? (
                                                    <Image
                                                        src={posterUrl}
                                                        alt={title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                                                        {isMovieItem ? <Film className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-medium truncate group-hover:text-accent-primary transition-colors">
                                                    {title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
                                                    <span className={cn(
                                                        'px-2 py-0.5 rounded text-xs',
                                                        isMovieItem ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                                    )}>
                                                        {isMovieItem ? 'Movie' : 'TV'}
                                                    </span>
                                                    {year && <span>{year}</span>}
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-sm">
                                                <span>★</span>
                                                <span>{item.vote_average.toFixed(1)}</span>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* View All Results */}
                        <Link
                            href={`/search?q=${encodeURIComponent(query)}`}
                            onClick={handleResultClick}
                            className="flex items-center justify-center gap-2 p-4 text-accent-primary hover:bg-accent-primary/10 transition-colors border-t border-border"
                        >
                            <TrendingUp className="w-4 h-4" />
                            View all results for &quot;{query}&quot;
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
