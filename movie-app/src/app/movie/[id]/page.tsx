import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Play, Star, Clock, Calendar, Globe, Film } from 'lucide-react';
import { getMovieDetails } from '@/lib/tmdb';
import { getImageUrl, formatRuntime, formatYear, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MovieCarousel } from '@/components/movie/MovieCarousel';
import { AddToListButton } from '@/components/ui/AddToListButton';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const movie = await getMovieDetails(parseInt(id));
        return {
            title: movie.title,
            description: movie.overview,
            openGraph: {
                title: movie.title,
                description: movie.overview,
                images: [getImageUrl(movie.backdrop_path, 'large', 'backdrop')],
            },
        };
    } catch {
        return {
            title: 'Movie Not Found',
        };
    }
}

export default async function MovieDetailPage({ params }: Props) {
    const { id } = await params;
    let movie;

    try {
        movie = await getMovieDetails(parseInt(id));
    } catch {
        notFound();
    }

    const backdropUrl = getImageUrl(movie.backdrop_path, 'original', 'backdrop');
    const posterUrl = getImageUrl(movie.poster_path, 'large', 'poster');
    const year = formatYear(movie.release_date);
    const runtime = formatRuntime(movie.runtime);
    const director = movie.credits?.crew?.find(c => c.job === 'Director');
    const cast = movie.credits?.cast?.slice(0, 8) || [];
    const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const similar = movie.similar?.results || [];

    return (
        <div className="min-h-screen">
            {/* Hero Backdrop */}
            <div className="relative h-[70vh] min-h-[500px]">
                <Image
                    src={backdropUrl}
                    alt={movie.title}
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 md:px-8 -mt-64 relative z-10">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Poster */}
                    <div className="flex-shrink-0 w-64 hidden md:block">
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src={posterUrl}
                                alt={movie.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-6">
                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold text-white">
                            {movie.title}
                        </h1>

                        {/* Tagline */}
                        {movie.tagline && (
                            <p className="text-xl text-accent-primary italic">
                                &quot;{movie.tagline}&quot;
                            </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1 px-3 py-1 bg-accent-primary rounded-full">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <Calendar className="w-4 h-4" />
                                <span>{year}</span>
                            </div>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <Clock className="w-4 h-4" />
                                <span>{runtime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <Globe className="w-4 h-4" />
                                <span className="uppercase">{movie.original_language}</span>
                            </div>
                        </div>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-2">
                            {movie.genres.map((genre) => (
                                <Badge key={genre.id} variant="primary">
                                    {genre.name}
                                </Badge>
                            ))}
                        </div>

                        {/* Overview */}
                        <p className="text-text-secondary text-lg leading-relaxed max-w-3xl">
                            {movie.overview}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link href={`/movie/${movie.id}/watch`}>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    leftIcon={<Play className="w-5 h-5 fill-current" />}
                                >
                                    Watch Now
                                </Button>
                            </Link>
                            {trailer && (
                                <a
                                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        leftIcon={<Film className="w-5 h-5" />}
                                    >
                                        Watch Trailer
                                    </Button>
                                </a>
                            )}
                            <AddToListButton item={movie} size="lg" />
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-border">
                            {director && (
                                <div>
                                    <p className="text-text-muted text-sm">Director</p>
                                    <p className="text-white font-medium">{director.name}</p>
                                </div>
                            )}
                            {movie.budget > 0 && (
                                <div>
                                    <p className="text-text-muted text-sm">Budget</p>
                                    <p className="text-white font-medium">{formatCurrency(movie.budget)}</p>
                                </div>
                            )}
                            {movie.revenue > 0 && (
                                <div>
                                    <p className="text-text-muted text-sm">Revenue</p>
                                    <p className="text-white font-medium">{formatCurrency(movie.revenue)}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-text-muted text-sm">Status</p>
                                <p className="text-white font-medium">{movie.status}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cast */}
                {cast.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-2xl font-bold text-white mb-6">Cast</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {cast.map((member) => (
                                <Link
                                    key={member.id}
                                    href={`/person/${member.id}`}
                                    className="text-center group"
                                >
                                    <div className="relative w-full aspect-square rounded-full overflow-hidden bg-background-card mb-3 group-hover:ring-2 ring-accent-primary transition-all">
                                        {member.profile_path ? (
                                            <Image
                                                src={getImageUrl(member.profile_path, 'medium', 'profile')}
                                                alt={member.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-text-muted text-2xl font-bold">
                                                {member.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-white text-sm font-medium line-clamp-1 group-hover:text-accent-primary transition-colors">{member.name}</p>
                                    <p className="text-text-muted text-xs line-clamp-1">{member.character}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Similar Movies */}
                {similar.length > 0 && (
                    <section className="mt-16">
                        <MovieCarousel title="You May Also Like" items={similar} />
                    </section>
                )}
            </div>
        </div>
    );
}
