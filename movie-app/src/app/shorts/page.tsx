import { ShortsFeed } from '@/components/shorts/ShortsFeed';
import { getPopularMovies, getMoviesWithVideos } from '@/lib/tmdb';

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
    const movies = await getPopularMovies(1);

    // Shuffle the popular movies first to ensure variety
    const shuffledMovies = shuffleArray(movies.results);

    // Take top 15 from shuffled list and enrich
    const withVideos = await getMoviesWithVideos(shuffledMovies.slice(0, 15));

    return (
        <div className="bg-black min-h-screen">
            <ShortsFeed initialMovies={withVideos} />
        </div>
    );
}
