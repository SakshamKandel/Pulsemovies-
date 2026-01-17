import { getHindiMovies } from '@/lib/tmdb';
import { MovieCarousel } from '@/components/movie/MovieCarousel';

export async function HindiMoviesSection() {
    const movies = await getHindiMovies();
    const withPosters = movies.results.filter(m => m.poster_path);

    if (withPosters.length === 0) return null;

    return (
        <section className="container mx-auto px-4 md:px-8">
            <MovieCarousel
                title="Best of Bollywood"
                items={withPosters}
                seeMoreLink="/browse/movies?language=hi"
            />
        </section>
    );
}
