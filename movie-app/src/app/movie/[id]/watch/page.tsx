import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, Clock, Calendar, Play } from 'lucide-react';
import { getMovieDetails } from '@/lib/tmdb';
import { formatRuntime, formatYear, getImageUrl } from '@/lib/utils';
import { PlayerEmbed } from '@/components/player/VidKingEmbed';
import { MovieCarousel } from '@/components/movie/MovieCarousel';
import { Button } from '@/components/ui/Button';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const movie = await getMovieDetails(parseInt(id));
        return {
            title: `Watch ${movie.title}`,
            description: `Stream ${movie.title} online in HD quality.`,
        };
    } catch {
        return {
            title: 'Watch Movie',
        };
    }
}

export default async function WatchMoviePage({ params }: Props) {
    const { id } = await params;
    let movie;

    try {
        movie = await getMovieDetails(parseInt(id));
    } catch {
        notFound();
    }

    const year = formatYear(movie.release_date);
    const runtime = formatRuntime(movie.runtime);
    const similar = movie.similar?.results || [];

    // Find the first logo in English or null language
    const logo = movie.images?.logos?.find(
        (img: any) => img.iso_639_1 === 'en' || img.iso_639_1 === null
    );

    return (
        <div className="relative min-h-screen bg-background">
            {/* Backdrop Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60 z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent z-10" />
                {movie.backdrop_path && (
                    <Image
                        src={getImageUrl(movie.backdrop_path, 'original', 'backdrop')}
                        alt={movie.title}
                        fill
                        className="object-cover opacity-30"
                        priority
                    />
                )}
            </div>

            <div className="relative z-20 pt-20 pb-16">
                <div className="container mx-auto px-4 md:px-8">
                    {/* Back Button */}
                    <Link href={`/movie/${movie.id}`}>
                        <Button variant="ghost" className="mb-6 hover:bg-white/10" leftIcon={<ArrowLeft className="w-4 h-4 text-white" />}>
                            Back to Details
                        </Button>
                    </Link>

                    {/* Content Layout */}
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_350px] gap-8">
                        {/* Left Column: Player and Main Info */}
                        <div className="space-y-6">
                            {/* Player Wrapper */}
                            <div className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
                                <PlayerEmbed tmdbId={movie.id} type="movie" />
                            </div>

                            {/* Movie Branding & Info */}
                            <div className="space-y-4">
                                {logo ? (
                                    <div className="relative h-32 w-72 mb-6">
                                        <Image
                                            src={getImageUrl(logo.file_path, 'original', 'logo')}
                                            alt={movie.title}
                                            fill
                                            className="object-contain object-left drop-shadow-2xl"
                                            priority
                                        />
                                    </div>
                                ) : (
                                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                        {movie.title}
                                    </h1>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-text-secondary text-sm md:text-base">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-white backdrop-blur-sm">
                                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                        <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                        <Calendar className="w-4 h-4" />
                                        <span>{year}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                        <Clock className="w-4 h-4" />
                                        <span>{runtime}</span>
                                    </div>
                                    <div className="hidden md:block w-px h-4 bg-white/20" />
                                    <div className="flex flex-wrap gap-2">
                                        {movie.genres.slice(0, 3).map((genre) => (
                                            <span
                                                key={genre.id}
                                                className="px-3 py-1 text-xs border border-white/20 rounded-full hover:bg-white/10 transition-colors cursor-default"
                                            >
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <p className="text-text-secondary text-lg leading-relaxed max-w-4xl pt-2">
                                    {movie.overview}
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Up Next / Similar (Desktop) */}
                        <div className="hidden lg:block space-y-6">
                            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-accent-primary rounded-full" />
                                More Like This
                            </h3>
                            <div className="flex flex-col gap-3 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
                                {similar.slice(0, 10).map((item: any) => (
                                    <Link
                                        key={item.id}
                                        href={`/movie/${item.id}`}
                                        className="group flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10 bg-black/20"
                                    >
                                        <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-background-card shadow-lg">
                                            {item.backdrop_path ? (
                                                <>
                                                    <Image
                                                        src={getImageUrl(item.backdrop_path, 'small', 'backdrop')}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Play className="w-8 h-8 text-white fill-white drop-shadow-lg" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/5">
                                                    <Play className="w-8 h-8 text-text-muted" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-accent-primary transition-colors leading-snug">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                                    <span>{item.vote_average.toFixed(1)}</span>
                                                </div>
                                                <span>{formatYear(item.release_date)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Similar Movies (Mobile/Tablet) */}
                    <div className="mt-16 lg:hidden">
                        <MovieCarousel title="More Like This" items={similar} />
                    </div>
                </div>
            </div>
        </div>
    );
}
