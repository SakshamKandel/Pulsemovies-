import { getPopularMovies, getPopularTV, getTrendingMovies } from '@/lib/tmdb';
import { MovieCard } from '@/components/movie/MovieCard';
import { MOVIE_GENRES } from '@/lib/constants';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Browse',
    description: 'Browse all movies and TV shows',
};

export default async function BrowsePage() {
    const [trending, popularMovies, popularTV] = await Promise.all([
        getTrendingMovies(),
        getPopularMovies(),
        getPopularTV(),
    ]);

    // Combine and shuffle for variety
    const allContent = [
        ...trending.results.map(m => ({ ...m, media_type: 'movie' as const })),
        ...popularMovies.results.map(m => ({ ...m, media_type: 'movie' as const })),
        ...popularTV.results.map(t => ({ ...t, media_type: 'tv' as const })),
    ].slice(0, 30);

    // Get unique genre IDs from content
    const genreIds = [...new Set(allContent.flatMap(item => item.genre_ids))].slice(0, 12);

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 md:px-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Browse All</h1>

                {/* Genre Pills */}
                <div className="flex flex-wrap gap-3 mb-12">
                    <Link
                        href="/browse/movies"
                        className="inline-flex items-center justify-center px-4 py-2 bg-accent-primary text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Movies
                    </Link>
                    <Link
                        href="/browse/series"
                        className="inline-flex items-center justify-center px-4 py-2 bg-background-card text-text-secondary rounded-full text-sm font-medium hover:bg-accent-primary hover:text-white transition-colors"
                    >
                        TV Shows
                    </Link>
                    {genreIds.map((id) => (
                        MOVIE_GENRES[id] && (
                            <Link
                                key={id}
                                href={`/browse?genre=${id}`}
                                className="inline-flex items-center justify-center px-4 py-2 bg-background-card text-text-secondary rounded-full text-sm font-medium hover:bg-accent-primary hover:text-white transition-colors"
                            >
                                {MOVIE_GENRES[id]}
                            </Link>
                        )
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {allContent.map((item, index) => (
                        <MovieCard key={`${item.media_type}-${item.id}`} item={item} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
