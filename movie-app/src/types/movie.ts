// Movie and TV Show Types for TMDB API

export interface Movie {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    adult: boolean;
    genre_ids: number[];
    original_language: string;
    video: boolean;
    media_type?: 'movie';
    images?: {
        logos: {
            file_path: string;
            iso_639_1: string | null;
        }[];
    };
}

export interface TVShow {
    id: number;
    name: string;
    original_name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
    origin_country: string[];
    original_language: string;
    media_type?: 'tv';
}

export interface MovieDetails extends Omit<Movie, 'genre_ids'> {
    genres: Genre[];
    runtime: number;
    status: string;
    tagline: string;
    budget: number;
    revenue: number;
    production_companies: ProductionCompany[];
    spoken_languages: SpokenLanguage[];
    belongs_to_collection: Collection | null;
    imdb_id: string | null;
    homepage: string | null;
    credits?: Credits;
    videos?: VideoResults;
    similar?: MovieListResponse;
    recommendations?: MovieListResponse;
}

export interface TVShowDetails extends Omit<TVShow, 'genre_ids'> {
    genres: Genre[];
    episode_run_time: number[];
    status: string;
    tagline: string;
    number_of_episodes: number;
    number_of_seasons: number;
    seasons: Season[];
    created_by: Creator[];
    networks: Network[];
    production_companies: ProductionCompany[];
    last_episode_to_air: Episode | null;
    next_episode_to_air: Episode | null;
    homepage: string | null;
    credits?: Credits;
    videos?: VideoResults;
    similar?: TVShowListResponse;
    recommendations?: TVShowListResponse;
    images?: {
        logos: {
            file_path: string;
            iso_639_1: string | null;
        }[];
    };
}

export interface Genre {
    id: number;
    name: string;
}

export interface ProductionCompany {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
}

export interface SpokenLanguage {
    english_name: string;
    iso_639_1: string;
    name: string;
}

export interface Collection {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
}

export interface Season {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    episode_count: number;
    air_date: string;
}

export interface Episode {
    id: number;
    name: string;
    overview: string;
    still_path: string | null;
    episode_number: number;
    season_number: number;
    air_date: string;
    vote_average: number;
    runtime: number;
}

export interface Creator {
    id: number;
    name: string;
    profile_path: string | null;
}

export interface Network {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
}

export interface Credits {
    cast: CastMember[];
    crew: CrewMember[];
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
}

export interface CrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
}

export interface Video {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
}

export interface VideoResults {
    results: Video[];
}

export interface MovieListResponse {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
}

export interface TVShowListResponse {
    page: number;
    results: TVShow[];
    total_pages: number;
    total_results: number;
}

export interface MultiSearchResult {
    page: number;
    results: (Movie | TVShow | Person)[];
    total_pages: number;
    total_results: number;
}

export interface Person {
    id: number;
    name: string;
    profile_path: string | null;
    known_for_department: string;
    popularity: number;
    media_type: 'person';
    known_for: (Movie | TVShow)[];
}

export type MediaType = 'movie' | 'tv' | 'person';
export type ContentItem = Movie | TVShow;
