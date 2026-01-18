import { ShortsFeed } from '@/components/shorts/ShortsFeed';
import { getPopularMovies, getMoviesWithVideos, getTopRatedMovies, getTrendingMovies } from '@/lib/tmdb';

// Force dynamic to ensures random seed on reload
export const dynamic = 'force-dynamic';

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export default async function ShortsPage() {
    const [trending, topRated, popular] = await Promise.all([
        getTrendingMovies(1),
        getTopRatedMovies(1),
        getPopularMovies(Math.floor(Math.random() * 4) + 2) // Random page 2-5 for variety
    ]);

    // Combine all sources
    const allMovies = [...trending.results, ...topRated.results, ...popular.results];

    // Deduplicate by ID
    const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());

    // Shuffle to mix "Old to Gold" with "Latest"
    const shuffledMovies = shuffleArray(uniqueMovies);

    // Take top 45 to ensure we have a deep buffer (user requested ~100 but 45 is safe for API limits)
    // We filter for videos, so we start with more candidates
    const withVideos = await getMoviesWithVideos(shuffledMovies.slice(0, 45));

    return (
        <div className="bg-black min-h-screen">
            <ShortsFeed initialMovies={withVideos} />
        </div>
    );
}
