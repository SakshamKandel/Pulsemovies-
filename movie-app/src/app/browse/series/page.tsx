import { getPopularTV, getTopRatedTV, getTrendingTV } from '@/lib/tmdb';
import { MovieCard } from '@/components/movie/MovieCard';
import { TV_GENRES } from '@/lib/constants';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'TV Shows',
    description: 'Browse all TV shows and series',
};

interface PageProps {
    searchParams: Promise<{ sort?: string; genre?: string }>;
}

export default async function SeriesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const sort = params.sort || 'popular';

    // Fetch TV shows based on sort parameter
    let shows;
    let pageTitle = 'TV Shows';

    switch (sort) {
        case 'trending':
            shows = await getTrendingTV();
            pageTitle = 'Trending TV Shows';
            break;
        case 'top_rated':
            shows = await getTopRatedTV();
            pageTitle = 'Top Rated TV Shows';
            break;
        default:
            shows = await getPopularTV();
            pageTitle = 'Popular TV Shows';
    }

    const sortOptions = [
        { key: 'popular', label: 'Popular' },
        { key: 'trending', label: 'Trending' },
        { key: 'top_rated', label: 'Top Rated' },
    ];

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 md:px-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">{pageTitle}</h1>

                {/* Sort Options */}
                <div className="flex flex-wrap gap-3 mb-8 items-center">
                    {sortOptions.map((option) => (
                        <Link
                            key={option.key}
                            href={`/browse/series?sort=${option.key}`}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center justify-center ${sort === option.key
                                ? 'bg-accent-primary text-white'
                                : 'bg-background-card text-text-secondary hover:bg-accent-primary/20 hover:text-white'
                                }`}
                        >
                            {option.label}
                        </Link>
                    ))}
                </div>

                {/* Genre Pills */}
                <div className="flex flex-wrap gap-2 mb-10 items-center">
                    {Object.entries(TV_GENRES).slice(0, 12).map(([id, name]) => (
                        <Link
                            key={id}
                            href={`/browse/series?genre=${id}`}
                            className="px-4 py-2 bg-white/5 text-text-muted rounded-full text-sm font-medium hover:bg-accent-primary/20 hover:text-white transition-colors flex items-center justify-center"
                        >
                            {name}
                        </Link>
                    ))}
                </div>

                {/* TV Shows Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                    {shows.results.map((show, index) => (
                        <MovieCard key={show.id} item={show} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
