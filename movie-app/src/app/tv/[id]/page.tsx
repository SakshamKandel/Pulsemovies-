import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Play, Plus, Star, Clock, Calendar, Globe, Tv } from 'lucide-react';
import { getTVDetails } from '@/lib/tmdb';
import { getImageUrl, formatYear } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MovieCarousel } from '@/components/movie/MovieCarousel';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const show = await getTVDetails(parseInt(id));
        return {
            title: show.name,
            description: show.overview,
            openGraph: {
                title: show.name,
                description: show.overview,
                images: [getImageUrl(show.backdrop_path, 'large', 'backdrop')],
            },
        };
    } catch {
        return {
            title: 'TV Show Not Found',
        };
    }
}

export default async function TVDetailPage({ params }: Props) {
    const { id } = await params;
    let show;

    try {
        show = await getTVDetails(parseInt(id));
    } catch {
        notFound();
    }

    const backdropUrl = getImageUrl(show.backdrop_path, 'original', 'backdrop');
    const posterUrl = getImageUrl(show.poster_path, 'large', 'poster');
    const year = formatYear(show.first_air_date);
    const cast = show.credits?.cast?.slice(0, 8) || [];
    const similar = show.similar?.results || [];

    return (
        <div className="min-h-screen">
            {/* Hero Backdrop */}
            <div className="relative h-[70vh] min-h-[500px]">
                <Image
                    src={backdropUrl}
                    alt={show.name}
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
                                alt={show.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-6">
                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold text-white">
                            {show.name}
                        </h1>

                        {/* Tagline */}
                        {show.tagline && (
                            <p className="text-xl text-accent-primary italic">
                                &quot;{show.tagline}&quot;
                            </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1 px-3 py-1 bg-accent-primary rounded-full">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-semibold">{show.vote_average.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <Calendar className="w-4 h-4" />
                                <span>{year}</span>
                            </div>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <Tv className="w-4 h-4" />
                                <span>{show.number_of_seasons} Seasons</span>
                            </div>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <Globe className="w-4 h-4" />
                                <span className="uppercase">{show.original_language}</span>
                            </div>
                        </div>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-2">
                            {show.genres.map((genre) => (
                                <Badge key={genre.id} variant="primary">
                                    {genre.name}
                                </Badge>
                            ))}
                        </div>

                        {/* Overview */}
                        <p className="text-text-secondary text-lg leading-relaxed max-w-3xl">
                            {show.overview}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link href={`/tv/${show.id}/watch`}>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    leftIcon={<Play className="w-5 h-5 fill-current" />}
                                >
                                    Watch Now
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="lg"
                                leftIcon={<Plus className="w-5 h-5" />}
                            >
                                Add to List
                            </Button>
                        </div>

                        {/* Seasons */}
                        {show.seasons && show.seasons.length > 0 && (
                            <div className="pt-6 border-t border-border">
                                <h3 className="text-lg font-semibold text-white mb-4">Seasons</h3>
                                <div className="flex flex-wrap gap-2">
                                    {show.seasons.filter(s => s.season_number > 0).map((season) => (
                                        <Link
                                            key={season.id}
                                            href={`/tv/${show.id}/watch?season=${season.season_number}`}
                                            className="px-4 py-2 bg-background-card rounded-lg text-text-secondary hover:bg-accent-primary hover:text-white transition-colors"
                                        >
                                            Season {season.season_number}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cast */}
                {cast.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-2xl font-bold text-white mb-6">Cast</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {cast.map((member) => (
                                <div key={member.id} className="text-center">
                                    <div className="relative w-full aspect-square rounded-full overflow-hidden bg-background-card mb-3">
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
                                    <p className="text-white text-sm font-medium line-clamp-1">{member.name}</p>
                                    <p className="text-text-muted text-xs line-clamp-1">{member.character}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Similar Shows */}
                {similar.length > 0 && (
                    <section className="mt-16">
                        <MovieCarousel title="You May Also Like" items={similar} />
                    </section>
                )}
            </div>
        </div>
    );
}
