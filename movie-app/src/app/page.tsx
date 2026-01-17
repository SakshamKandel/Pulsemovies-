import { DiscoveryBar } from '@/components/discovery/DiscoveryBar';
import { RouletteModal } from '@/components/ui/RouletteModal';
import { HeroBanner } from '@/components/home/HeroBanner';
import { MoodPicker } from '@/components/home/MoodPicker';
import { MovieCarousel } from '@/components/movie/MovieCarousel';
import { PlatformCarousel } from '@/components/home/PlatformCarousel';
import { UserSections } from '@/components/home/UserSections';
import { AwardsSection } from '@/components/home/AwardsSection';
import { AnniversarySection } from '@/components/home/AnniversarySection';
import { BecauseYouWatched } from '@/components/home/BecauseYouWatched';
import { ForYouSection } from '@/components/home/ForYouSection';
import { HindiMoviesSection } from '@/components/home/HindiMoviesSection';
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

// Force dynamic rendering to ensure fresh content on reload
export const dynamic = 'force-dynamic';

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

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

  // Shuffle trending movies to get random hero content on every reload
  const shuffledTrending = shuffleArray(trendingMovies.results);

  // Fetch logos for hero section (top 5 random movies from trending)
  const heroMovies = await getMoviesWithLogos(shuffledTrending.slice(0, 5));

  // Fallback for Prime Video if provider fetch returns empty (common issue with some regions/API keys)
  const finalPrimeMovies = primeMovies.results.length > 0 ? primeMovies.results : popularMovies.results.slice(0, 10);

  // Pool for Roulette (ensure unique by ID logic handled by random picker or simple merge)
  const roulettePool = [...trendingMovies.results, ...topRatedMovies.results, ...popularMovies.results];

  return (
    <div className="min-h-screen bg-background">
      <RouletteModal allMovies={roulettePool} />

      <HeroBanner movies={heroMovies} />

      <DiscoveryBar />

      {/* Content Sections */}
      <div className="relative z-10 bg-background">
        <div className="space-y-14 pb-20 pt-10 md:pt-20">

          {/* Mood Discovery - New Feature */}
          <MoodPicker />

          {/* For You - Based on Genre Preferences */}
          <ForYouSection />

          {/* User Sections - Continue Watching & My List (client-side with cache) */}
          <UserSections />

          {/* Personalized Recommendations - Based on Watch History */}
          <BecauseYouWatched />

          {/* Awards & Oscar Winners */}
          <AwardsSection />

          {/* Released Today in History */}
          <AnniversarySection />

          {/* Bollywood Hits - New Section */}
          <HindiMoviesSection />

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
