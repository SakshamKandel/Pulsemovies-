// App Constants and Configuration

export const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
export const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

// Image Sizes
export const IMAGE_SIZES = {
    poster: {
        small: 'w185',
        medium: 'w342',
        large: 'w500',
        original: 'original',
    },
    backdrop: {
        small: 'w300',
        medium: 'w780',
        large: 'w1280',
        original: 'original',
    },
    profile: {
        small: 'w45',
        medium: 'w185',
        large: 'h632',
        original: 'original',
    },
    logo: {
        small: 'w45',
        medium: 'w185',
        large: 'w500',
        original: 'original',
    },
} as const;

// Genre Mappings
export const MOVIE_GENRES: Record<number, string> = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western',
};

export const TV_GENRES: Record<number, string> = {
    10759: 'Action & Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    10762: 'Kids',
    9648: 'Mystery',
    10763: 'News',
    10764: 'Reality',
    10765: 'Sci-Fi & Fantasy',
    10766: 'Soap',
    10767: 'Talk',
    10768: 'War & Politics',
    37: 'Western',
};

// API Endpoints
export const ENDPOINTS = {
    // Movies
    trendingMovies: '/trending/movie/week',
    popularMovies: '/movie/popular',
    topRatedMovies: '/movie/top_rated',
    upcomingMovies: '/movie/upcoming',
    nowPlayingMovies: '/movie/now_playing',
    movieDetails: (id: number) => `/movie/${id}`,
    movieCredits: (id: number) => `/movie/${id}/credits`,
    movieVideos: (id: number) => `/movie/${id}/videos`,
    movieSimilar: (id: number) => `/movie/${id}/similar`,
    movieRecommendations: (id: number) => `/movie/${id}/recommendations`,

    // TV Shows
    trendingTV: '/trending/tv/week',
    popularTV: '/tv/popular',
    topRatedTV: '/tv/top_rated',
    airingTodayTV: '/tv/airing_today',
    onTheAirTV: '/tv/on_the_air',
    tvDetails: (id: number) => `/tv/${id}`,
    tvCredits: (id: number) => `/tv/${id}/credits`,
    tvVideos: (id: number) => `/tv/${id}/videos`,
    tvSimilar: (id: number) => `/tv/${id}/similar`,
    tvSeasonDetails: (tvId: number, seasonNumber: number) => `/tv/${tvId}/season/${seasonNumber}`,

    // Search
    searchMulti: '/search/multi',
    searchMovie: '/search/movie',
    searchTV: '/search/tv',

    // Discover
    discoverMovie: '/discover/movie',
    discoverTV: '/discover/tv',

    // Genres
    movieGenres: '/genre/movie/list',
    tvGenres: '/genre/tv/list',
} as const;

// Site Configuration
export const SITE_CONFIG = {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Pulse',
    description: 'Your premium destination for movies and TV shows',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};

// Navigation Items
export const NAV_ITEMS = [
    { label: 'Home', href: '/' },
    { label: 'Movies', href: '/browse/movies' },
    { label: 'TV Shows', href: '/browse/series' },
    { label: 'My List', href: '/my-list' },
];
