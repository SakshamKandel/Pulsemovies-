import { Suspense } from 'react';
import { searchMulti } from '@/lib/tmdb';
import { MovieCard } from '@/components/movie/MovieCard';
import { SearchBar } from '@/components/search/SearchBar';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import type { Movie, TVShow } from '@/types/movie';
import type { Metadata } from 'next';

interface Props {
    searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { q } = await searchParams;
    return {
        title: q ? `Search: ${q}` : 'Search',
        description: `Search for movies and TV shows${q ? ` - "${q}"` : ''}`,
    };
}

async function SearchResults({ query, page }: { query: string; page: number }) {
    const results = await searchMulti(query, page);
    const items = results.results.filter(
        (item): item is Movie | TVShow => item.media_type !== 'person'
    );

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-text-secondary">
                    Try searching for something else or check your spelling.
                </p>
            </div>
        );
    }

    return (
        <div>
            <p className="text-text-secondary mb-6">
                Found {results.total_results.toLocaleString()} results for &quot;{query}&quot;
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {items.map((item, index) => (
                    <MovieCard key={item.id} item={item} index={index} />
                ))}
            </div>

            {/* Pagination */}
            {results.total_pages > 1 && (
                <div className="flex justify-center gap-4 mt-12">
                    {page > 1 && (
                        <a
                            href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                            className="px-6 py-3 bg-background-card rounded-lg text-white hover:bg-accent-primary transition-colors"
                        >
                            Previous
                        </a>
                    )}
                    <span className="px-6 py-3 text-text-secondary">
                        Page {page} of {results.total_pages}
                    </span>
                    {page < results.total_pages && (
                        <a
                            href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                            className="px-6 py-3 bg-background-card rounded-lg text-white hover:bg-accent-primary transition-colors"
                        >
                            Next
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

function SearchResultsSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 18 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
            ))}
        </div>
    );
}

export default async function SearchPage({ searchParams }: Props) {
    const { q: query, page: pageStr } = await searchParams;
    const page = parseInt(pageStr || '1', 10);

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 md:px-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Search</h1>

                {/* Search Bar */}
                <div className="mb-12">
                    <SearchBar />
                </div>

                {/* Results */}
                {query ? (
                    <Suspense fallback={<SearchResultsSkeleton />}>
                        <SearchResults query={query} page={page} />
                    </Suspense>
                ) : (
                    <div className="text-center py-16">
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Start searching
                        </h3>
                        <p className="text-text-secondary">
                            Search for your favorite movies and TV shows
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
