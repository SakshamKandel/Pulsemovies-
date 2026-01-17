'use client';

import * as React from 'react';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { discoverMovies } from '@/lib/tmdb';
import { MovieCarousel } from '@/components/movie/MovieCarousel';
import { MOVIE_GENRES } from '@/lib/constants';
import type { Movie } from '@/types/movie';

export function ForYouSection() {
    const { favoriteGenres, hasCompletedOnboarding } = usePreferencesStore();
    const [movies, setMovies] = React.useState<Movie[]>([]);
    const [genreName, setGenreName] = React.useState<string>('');
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (!mounted || favoriteGenres.length === 0) return;

        const fetchMovies = async () => {
            // Pick a random genre from user's favorites
            const randomGenre = favoriteGenres[Math.floor(Math.random() * favoriteGenres.length)];
            setGenreName(MOVIE_GENRES[randomGenre] || 'Your Picks');

            try {
                const response = await discoverMovies({
                    with_genres: String(randomGenre),
                    sort_by: 'popularity.desc',
                    'vote_average.gte': 6.0,
                });
                // Filter out items without posters
                setMovies(response.results.filter(m => m.poster_path));
            } catch {
                // Silently fail
            }
        };

        fetchMovies();
    }, [mounted, favoriteGenres]);

    // Don't show if no preferences or not enough movies
    if (!mounted || !hasCompletedOnboarding || favoriteGenres.length === 0 || movies.length === 0) {
        return null;
    }

    return (
        <section className="container mx-auto px-4 md:px-8">
            <MovieCarousel
                title={`For You: ${genreName}`}
                items={movies}
                seeMoreLink={`/browse/movies?genre=${favoriteGenres[0]}`}
            />
        </section>
    );
}
