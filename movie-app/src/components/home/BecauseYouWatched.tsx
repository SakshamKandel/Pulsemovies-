'use client';

import * as React from 'react';
import { useContinueWatchingStore } from '@/store/useContinueWatchingStore';
import { getMovieRecommendations } from '@/lib/tmdb';
import { MovieCarousel } from '@/components/movie/MovieCarousel';
import { getContentTitle } from '@/lib/utils';
import type { Movie } from '@/types/movie';

export function BecauseYouWatched() {
    const { items } = useContinueWatchingStore();
    const [recommendations, setRecommendations] = React.useState<Movie[]>([]);
    const [basedOnTitle, setBasedOnTitle] = React.useState<string>('');
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (!mounted || items.length === 0) return;

        // Get the most recently watched movie
        const sortedItems = [...items].sort((a, b) => b.timestamp - a.timestamp);
        const lastWatched = sortedItems[0];

        // Only use movies for recommendations (not TV shows)
        const isMovie = 'title' in lastWatched.item;
        if (!isMovie) {
            // Try to find a movie in the list
            const lastWatchedMovie = sortedItems.find(item => 'title' in item.item);
            if (!lastWatchedMovie) return;

            fetchRecommendations(lastWatchedMovie.item.id, getContentTitle(lastWatchedMovie.item));
        } else {
            fetchRecommendations(lastWatched.item.id, getContentTitle(lastWatched.item));
        }
    }, [mounted, items]);

    const fetchRecommendations = async (movieId: number, title: string) => {
        try {
            const response = await getMovieRecommendations(movieId);
            // Filter out items without posters
            const filtered = response.results.filter(m => m.poster_path).slice(0, 15);
            if (filtered.length > 0) {
                setRecommendations(filtered);
                setBasedOnTitle(title);
            }
        } catch (error) {
            // Silently fail
        }
    };

    if (!mounted || recommendations.length === 0) {
        return null;
    }

    return (
        <section className="container mx-auto px-4 md:px-8">
            <MovieCarousel
                title={`Because You Watched "${basedOnTitle}"`}
                items={recommendations}
            />
        </section>
    );
}
