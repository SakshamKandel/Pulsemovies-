import { Suspense } from 'react';
import Link from 'next/link';
import { getMoviesByGenre, getTopRatedMovies } from '@/lib/tmdb';
import { MovieCard } from '@/components/movie/MovieCard';
import { MovieRowSkeleton } from '@/components/ui/Skeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Collections - Curated Movie Lists',
    description: 'Explore curated movie collections including Oscar Winners, Classic Comedies, Sci-Fi Essentials, and more.',
};

// Curated collections with genre IDs or custom queries
const COLLECTIONS = [
    { id: 'top-rated', name: 'Critics\' Picks', description: 'Highest rated films of all time' },
    { id: 'action', name: 'Action Essentials', genreId: 28, description: 'Adrenaline-pumping action' },
    { id: 'comedy', name: 'Comedy Classics', genreId: 35, description: 'Guaranteed to make you laugh' },
    { id: 'horror', name: 'Horror Vault', genreId: 27, description: 'Spine-chilling scares' },
    { id: 'scifi', name: 'Sci-Fi Frontiers', genreId: 878, description: 'Explore the universe' },
    { id: 'romance', name: 'Love Stories', genreId: 10749, description: 'Heartwarming romances' },
    { id: 'thriller', name: 'Edge of Your Seat', genreId: 53, description: 'Suspenseful thrillers' },
    { id: 'animation', name: 'Animated Worlds', genreId: 16, description: 'Stunning animation' },
    { id: 'documentary', name: 'True Stories', genreId: 99, description: 'Real-world documentaries' },
];

async function CollectionRow({ collection }: { collection: typeof COLLECTIONS[0] }) {
    let movies;

    if (collection.id === 'top-rated') {
        const response = await getTopRatedMovies();
        movies = response.results.slice(0, 10);
    } else if (collection.genreId) {
        const response = await getMoviesByGenre(collection.genreId);
        movies = response.results.slice(0, 10);
    } else {
        return null;
    }

    if (!movies || movies.length === 0) return null;

    return (
        <section className="mb-12">
            <div className="flex items-end justify-between mb-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">{collection.name}</h2>
                    <p className="text-sm text-text-muted">{collection.description}</p>
                </div>
                {collection.genreId && (
                    <Link
                        href={`/browse?genre=${collection.genreId}`}
                        className="text-sm text-accent-primary hover:underline"
                    >
                        See All
                    </Link>
                )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {movies.map((movie, index) => (
                    <MovieCard key={movie.id} item={movie} index={index} />
                ))}
            </div>
        </section>
    );
}

export default async function CollectionsPage() {
    return (
        <div className="min-h-screen pt-20 pb-16">
            <div className="container mx-auto px-4 md:px-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Collections</h1>
                <p className="text-text-muted mb-10">Curated lists to help you find your next watch</p>

                {COLLECTIONS.map((collection) => (
                    <Suspense key={collection.id} fallback={<MovieRowSkeleton />}>
                        <CollectionRow collection={collection} />
                    </Suspense>
                ))}
            </div>
        </div>
    );
}
