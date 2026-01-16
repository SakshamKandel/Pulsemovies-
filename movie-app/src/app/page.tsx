import { HeroBanner } from '@/components/home/HeroBanner';
import { MovieCarousel } from '@/components/movie/MovieCarousel';
import { PlatformCarousel } from '@/components/home/PlatformCarousel';
import { UserSections } from '@/components/home/UserSections';
import { PLATFORMS } from '@/config/platforms';
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getTrendingTV,
  getPopularTV,
  getTopRatedTV,
  getMoviesByProvider,
  getTVByProvider,
  getMoviesWithLogos
} from '@/lib/tmdb';

export const revalidate = 3600;

export default async function HomePage() {
  const [
    trendingMovies,
    popularMovies,
    topRatedMovies,
    upcomingMovies,
    trendingTV,
    popularTV,
    topRatedTV,
    netflixMovies,
    disneyMovies,
    primeMovies,
    paramountMovies
  ] = await Promise.all([
    getTrendingMovies(),
    getPopularMovies(),
    getTopRatedMovies(),
    getUpcomingMovies(),
    getTrendingTV(),
    getPopularTV(),
    getTopRatedTV(),
    getMoviesByProvider(8), // Netflix
    getMoviesByProvider(337), // Disney+
    getMoviesByProvider(119), // Prime Video
    getMoviesByProvider(531) // Paramount+
  ]);

  // Fetch logos for hero section (top 5 movies)
  const heroMovies = await getMoviesWithLogos(trendingMovies.results);

  // Fallback for Prime Video if provider fetch returns empty (common issue with some regions/API keys)
  const finalPrimeMovies = primeMovies.results.length > 0 ? primeMovies.results : popularMovies.results.slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <HeroBanner movies={heroMovies} />

      {/* Content Sections */}
      <div className="relative z-10 bg-background">
        <div className="space-y-14 pb-8 pt-4">
          {/* User Sections - Continue Watching & My List (client-side with cache) */}
          <UserSections />

          {/* Trending */}
          <section className="container mx-auto px-4 md:px-8">
            <MovieCarousel
              title="Trending Now"
              items={trendingMovies.results}
              seeMoreLink="/browse/movies?sort=trending"
            />
          </section>

          {/* Cleaned up Streaming Platforms Section - Specific Content */}
          <section className="container mx-auto px-4 md:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Streaming Platforms
            </h2>

            <div className="space-y-6">
              <PlatformCarousel platform={PLATFORMS.netflix} platformKey="netflix" items={netflixMovies.results} />
              <PlatformCarousel platform={PLATFORMS.disney} platformKey="disney" items={disneyMovies.results} />
              <PlatformCarousel platform={PLATFORMS.prime} platformKey="prime" items={finalPrimeMovies} />
              <PlatformCarousel platform={PLATFORMS.paramount} platformKey="paramount" items={paramountMovies.results} />
            </div>
          </section>

          {/* Top 10 */}
          <section className="container mx-auto px-4 md:px-8">
            <MovieCarousel
              title="Top 10 This Week"
              items={popularMovies.results.slice(0, 10)}
              showRank
              seeMoreLink="/browse/movies?sort=popular"
            />
          </section>

          {/* Popular TV Shows */}
          <section className="container mx-auto px-4 md:px-8">
            <MovieCarousel
              title="Popular TV Shows"
              items={trendingTV.results}
              seeMoreLink="/browse/series?sort=popular"
            />
          </section>

          {/* Critically Acclaimed */}
          <section className="container mx-auto px-4 md:px-8">
            <MovieCarousel
              title="Critically Acclaimed"
              items={topRatedMovies.results}
              seeMoreLink="/browse/movies?sort=top_rated"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
