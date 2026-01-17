import axios from 'axios';
import { TMDB_API_KEY, TMDB_BASE_URL, ENDPOINTS } from './constants';
import type {
    Movie,
    TVShow,
    MovieDetails,
    TVShowDetails,
    MovieListResponse,
    TVShowListResponse,
    MultiSearchResult,
    Genre,
} from '@/types/movie';

// Create axios instance for TMDB API
const tmdbApi = axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
        api_key: TMDB_API_KEY,
    },
});

// Fetch trending movies
export async function getTrendingMovies(page: number = 1): Promise<MovieListResponse> {
    const response = await tmdbApi.get(ENDPOINTS.trendingMovies, {
        params: {
            page,
            // While valid, append_to_response is typically for details endpoint. 
            // For lists, we might not get images for every item efficiently in one call depending on API support.
            // However, some list endpoints don't support append_to_response.
            // Better approach for Hero: Fetch list, then for top 5, fetch details in parallel to get logos.
        }
    });
    return response.data;
}

// Helper to enrich movies with logos (for Hero use)
export async function getMoviesWithLogos(movies: Movie[]): Promise<Movie[]> {
    const enriched = await Promise.all(
        movies.slice(0, 5).map(async (movie) => {
            try {
                const details = await getMovieDetails(movie.id);
                return { ...movie, images: details.images };
            } catch {
                return movie;
            }
        })
    );
    // Return original array with first 5 replaced/enriched
    return [...enriched, ...movies.slice(5)];
}

// Helper to enrich movies with videos (for Shorts use)
export async function getMoviesWithVideos(movies: Movie[]): Promise<Movie[]> {
    const enriched = await Promise.all(
        movies.map(async (movie) => {
            try {
                const details = await getMovieDetails(movie.id);
                // Filter for official trailers if possible, or just take the first video
                const videos = details.videos?.results || [];
                const trailer = videos.find(v => v.type === 'Trailer') || videos[0];

                // We'll attach the video key to the movie object if we modify the type, 
                // but since Movie type doesn't have video key, we might need to rely on component fetching 
                // OR we can pass the whole details. 
                // Actually, let's just return the enriched movie with a new property if TS allows, 
                // or just rely on the component to fetch individual videos to avoid rate limits?
                // LIMITS: Fetching 20 movies * 1 request = 20 requests. Might be heavy.
                // Better: Fetch top 10 movies for shorts.

                if (trailer) {
                    return { ...movie, video_key: trailer.key, images: details.images };
                }
                return { ...movie, images: details.images }; // Attempt to return images even if no trailer, though we filter later.
            } catch {
                return movie;
            }
        })
    );
    // Filter out movies without videos to ensure high quality shorts
    return enriched.filter((m: any) => m.video_key) as Movie[];
}

// Fetch popular movies
export async function getPopularMovies(page: number = 1): Promise<MovieListResponse> {
    const response = await tmdbApi.get(ENDPOINTS.popularMovies, { params: { page } });
    return response.data;
}

// Fetch top rated movies
export async function getTopRatedMovies(page: number = 1): Promise<MovieListResponse> {
    const response = await tmdbApi.get(ENDPOINTS.topRatedMovies, { params: { page } });
    return response.data;
}

// Fetch upcoming movies
export async function getUpcomingMovies(page: number = 1): Promise<MovieListResponse> {
    const response = await tmdbApi.get(ENDPOINTS.upcomingMovies, { params: { page } });
    return response.data;
}

// Fetch now playing movies
export async function getNowPlayingMovies(page: number = 1): Promise<MovieListResponse> {
    const response = await tmdbApi.get(ENDPOINTS.nowPlayingMovies, { params: { page } });
    return response.data;
}

// Fetch movie details with credits, videos, similar, and images (for logos)
export async function getMovieDetails(id: number): Promise<MovieDetails> {
    const response = await tmdbApi.get(ENDPOINTS.movieDetails(id), {
        params: {
            append_to_response: 'credits,videos,similar,recommendations,images',
            include_image_language: 'en,null',
        },
    });
    return response.data;
}

// Fetch trending TV shows
export async function getTrendingTV(page: number = 1): Promise<TVShowListResponse> {
    const response = await tmdbApi.get(ENDPOINTS.trendingTV, { params: { page } });
    return response.data;
}

// Fetch popular TV shows
export async function getPopularTV(page: number = 1): Promise<TVShowListResponse> {
    const response = await tmdbApi.get(ENDPOINTS.popularTV, { params: { page } });
    return response.data;
}

// Fetch top rated TV shows
export async function getTopRatedTV(page: number = 1): Promise<TVShowListResponse> {
    const response = await tmdbApi.get(ENDPOINTS.topRatedTV, { params: { page } });
    return response.data;
}

// Fetch TV show details
export async function getTVDetails(id: number): Promise<TVShowDetails> {
    const response = await tmdbApi.get(ENDPOINTS.tvDetails(id), {
        params: {
            append_to_response: 'credits,videos,similar,recommendations,images',
            include_image_language: 'en,null',
        },
    });
    return response.data;
}

// Fetch TV season details
export async function getTVSeasonDetails(id: number, seasonNumber: number): Promise<any> {
    const response = await tmdbApi.get(ENDPOINTS.tvSeasonDetails(id, seasonNumber));
    return response.data;
}

// Multi search (movies, TV, people)
export async function searchMulti(query: string, page: number = 1): Promise<MultiSearchResult> {
    const response = await tmdbApi.get(ENDPOINTS.searchMulti, {
        params: { query, page },
    });
    return response.data;
}

// Search movies only
export async function searchMovies(query: string, page: number = 1): Promise<MovieListResponse> {
    const response = await tmdbApi.get(ENDPOINTS.searchMovie, {
        params: { query, page },
    });
    return response.data;
}

// Search TV shows only
export async function searchTV(query: string, page: number = 1): Promise<TVShowListResponse> {
    const response = await tmdbApi.get(ENDPOINTS.searchTV, {
        params: { query, page },
    });
    return response.data;
}

// Discover movies with filters
export async function discoverMovies(
    params: {
        page?: number;
        with_genres?: string;
        sort_by?: string;
        year?: number;
        'vote_average.gte'?: number;
        with_watch_providers?: string;
        watch_region?: string;
    } = {}
): Promise<MovieListResponse> {
    const response = await tmdbApi.get(ENDPOINTS.discoverMovie, { params });
    return response.data;
}

// Discover TV shows with filters
export async function discoverTV(
    params: {
        page?: number;
        with_genres?: string;
        sort_by?: string;
        first_air_date_year?: number;
        'vote_average.gte'?: number;
        with_watch_providers?: string;
        watch_region?: string;
    } = {}
): Promise<TVShowListResponse> {
    const response = await tmdbApi.get(ENDPOINTS.discoverTV, { params });
    return response.data;
}

// Get movie genres
export async function getMovieGenres(): Promise<Genre[]> {
    const response = await tmdbApi.get(ENDPOINTS.movieGenres);
    return response.data.genres;
}

// Get TV genres
export async function getTVGenres(): Promise<Genre[]> {
    const response = await tmdbApi.get(ENDPOINTS.tvGenres);
    return response.data.genres;
}

// Get movies by genre
export async function getMoviesByGenre(genreId: number, page: number = 1): Promise<MovieListResponse> {
    return discoverMovies({ with_genres: genreId.toString(), page, sort_by: 'popularity.desc' });
}

// Get TV shows by genre
export async function getTVByGenre(genreId: number, page: number = 1): Promise<TVShowListResponse> {
    return discoverTV({ with_genres: genreId.toString(), page, sort_by: 'popularity.desc' });
}

// Get movies by provider
export async function getMoviesByProvider(providerId: number, page: number = 1): Promise<MovieListResponse> {
    return discoverMovies({
        with_watch_providers: providerId.toString(),
        watch_region: 'US',
        page,
        sort_by: 'popularity.desc'
    });
}

// Get TV shows by provider
export async function getTVByProvider(providerId: number, page: number = 1): Promise<TVShowListResponse> {
    return discoverTV({
        with_watch_providers: providerId.toString(),
        watch_region: 'US',
        page,
        sort_by: 'popularity.desc'
    });
}

export { tmdbApi };
