import axios from 'axios';
import { WatchFallback } from '@/components/movie/WatchFallback';
import { notFound } from 'next/navigation';
import { getMovieDetails } from '@/lib/tmdb';
import { WatchPageClient } from '@/components/movie/WatchPageClient';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const movie = await getMovieDetails(parseInt(id));
        return {
            title: `Watch ${movie.title}`,
            description: `Stream ${movie.title} online in HD quality.`,
        };
    } catch {
        return {
            title: 'Watch Movie',
        };
    }
}

export default async function WatchMoviePage({ params }: Props) {
    const { id } = await params;
    const movieId = Number(id);
    if (!Number.isSafeInteger(movieId) || movieId <= 0) notFound();
    let movie;

    try {
        movie = await getMovieDetails(parseInt(id));
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) notFound();
        return <WatchFallback id={movieId} />;
    }

    const similar = movie.similar?.results || [];

    // Find the first logo in English or null language
    const logo = movie.images?.logos?.find(
        (img) => img.iso_639_1 === 'en' || img.iso_639_1 === null
    ) || null;

    return <WatchPageClient movie={movie} similar={similar} logo={logo} />;
}
