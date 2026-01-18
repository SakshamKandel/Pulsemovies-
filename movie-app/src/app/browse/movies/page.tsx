import { getPopularMovies, getTopRatedMovies, getNowPlayingMovies, getUpcomingMovies, getTrendingMovies, getMoviesByGenre, getHindiMovies } from '@/lib/tmdb';
import { MovieCard } from '@/components/movie/MovieCard';
import { MOVIE_GENRES } from '@/lib/constants';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Movies',
    description: 'Browse all movies',
};

interface PageProps {
    searchParams: Promise<{ sort?: string; genre?: string; language?: string }>;
}

export default async function MoviesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const sort = params.sort;
    const genre = params.genre;
    const language = params.language;

    // Fetch movies based on parameters
    let movies;
    let pageTitle = 'Movies';

    if (language === 'hi') {
        movies = await getHindiMovies();
        pageTitle = 'Bollywood Movies';
    } else if (genre) {
        // Genre filtering (takes precedence over sort for now, or we could combine them if API supports it nicely)
        // Getting the genre name safely
        const genreId = parseInt(genre);
        const genreName = MOVIE_GENRES[genreId as keyof typeof MOVIE_GENRES] || 'Genre';
        movies = await getMoviesByGenre(genreId);
        pageTitle = `${genreName} Movies`;
    } else {
        // Sort based filtering
        switch (sort) {
            case 'trending':
                movies = await getTrendingMovies();
                pageTitle = 'Trending Movies';
                break;
            case 'top_rated':
                movies = await getTopRatedMovies();
                pageTitle = 'Top Rated Movies';
                break;
            case 'upcoming':
                movies = await getUpcomingMovies();
                pageTitle = 'Upcoming Movies';
                break;
            case 'now_playing':
                movies = await getNowPlayingMovies();
                pageTitle = 'Now Playing';
                break;
            default:
                movies = await getPopularMovies();
                pageTitle = 'Popular Movies';
        }
    }

    const sortOptions = [
        { key: 'popular', label: 'Popular' },
        { key: 'trending', label: 'Trending' },
        { key: 'top_rated', label: 'Top Rated' },
        { key: 'upcoming', label: 'Upcoming' },
        { key: 'now_playing', label: 'Now Playing' },
    ];

    return (
        <div className="min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4 md:px-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">{pageTitle}</h1>

                {/* Filters Container */}
                <div className="flex flex-col gap-6 mb-10">
                    {/* Genre Pills */}
                    <div className="flex flex-wrap gap-2 items-center">
                        {Object.entries(MOVIE_GENRES).slice(0, 14).map(([id, name]) => (
                            <Link
                                key={id}
                                href={`/browse/movies?genre=${id}`}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border flex items-center justify-center ${genre === id
                                    ? 'bg-accent-primary border-accent-primary text-white'
                                    : 'bg-white/5 border-white/10 text-text-muted hover:bg-accent-primary/20 hover:text-white hover:border-accent-primary/50'
                                    }`}
                            >
                                {name}
                            </Link>
                        ))}
                        <Link
                            href="/browse/movies"
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border flex items-center justify-center ${!genre
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'bg-transparent border-transparent text-text-muted hover:text-white'
                                }`}
                        >
                            Clear Filter
                        </Link>
                    </div>

                    {/* Sort Options (Only show if no genre is selected, or let them coexist if we implemented advanced filtering) */}
                    {!genre && (
                        <div className="flex flex-wrap gap-3 items-center">
                            {sortOptions.map((option) => (
                                <Link
                                    key={option.key}
                                    href={`/browse/movies?sort=${option.key}`}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center justify-center ${sort === option.key || (!sort && option.key === 'popular')
                                        ? 'bg-white text-black'
                                        : 'bg-background-card text-text-secondary hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {option.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Movies Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
                    {movies.results.map((movie, index) => (
                        <MovieCard key={movie.id} item={movie} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
