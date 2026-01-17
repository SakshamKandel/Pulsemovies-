import { getAnniversaryReleases } from '@/lib/tmdb';
import { MovieCarousel } from '@/components/movie/MovieCarousel';

export async function AnniversarySection() {
    const anniversaryMovies = await getAnniversaryReleases();

    if (!anniversaryMovies.results || anniversaryMovies.results.length === 0) {
        return null;
    }

    // Format today's date nicely
    const today = new Date();
    const monthName = today.toLocaleDateString('en-US', { month: 'long' });
    const day = today.getDate();

    return (
        <section className="container mx-auto px-4 md:px-8">
            <MovieCarousel
                title="Flashback: This Day in Cinema"
                items={anniversaryMovies.results}
                seeMoreLink="/browse/movies"
            />
        </section>
    );
}
