import { getAwardWinningMovies } from '@/lib/tmdb';
import { MovieCarousel } from '@/components/movie/MovieCarousel';

export async function AwardsSection() {
    const awardMovies = await getAwardWinningMovies();

    if (!awardMovies.results || awardMovies.results.length === 0) {
        return null;
    }

    return (
        <section className="container mx-auto px-4 md:px-8">
            <MovieCarousel
                title="Awards & Oscar Winners"
                items={awardMovies.results}
                seeMoreLink="/browse/movies?sort=vote_average.desc"
            />
        </section>
    );
}
