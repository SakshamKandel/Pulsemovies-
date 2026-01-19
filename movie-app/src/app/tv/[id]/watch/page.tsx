import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, Calendar, Tv, Play, Info } from 'lucide-react';
import { getTVDetails, getTVSeasonDetails } from '@/lib/tmdb';
import { formatYear, getImageUrl } from '@/lib/utils';
import { PlayerEmbed } from '@/components/player/VidKingEmbed';
import { MovieCarousel } from '@/components/movie/MovieCarousel';
import { Button } from '@/components/ui/Button';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ season?: string; episode?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const show = await getTVDetails(parseInt(id));
        return {
            title: `Watch ${show.name}`,
            description: `Stream ${show.name} online in HD quality.`,
        };
    } catch {
        return {
            title: 'Watch TV Show',
        };
    }
}

export default async function WatchTVPage({ params, searchParams }: Props) {
    const { id } = await params;
    const { season: seasonStr, episode: episodeStr } = await searchParams;

    const seasonNumber = parseInt(seasonStr || '1', 10);
    const episodeNumber = parseInt(episodeStr || '1', 10);

    let show;
    let seasonDetails;

    try {
        show = await getTVDetails(parseInt(id));
        // Fetch specific season details to get accurate episode list
        try {
            seasonDetails = await getTVSeasonDetails(parseInt(id), seasonNumber);
        } catch (e) {
            console.error('Failed to fetch season details', e);
            // Fallback to basic season info if available
            seasonDetails = { episodes: Array.from({ length: 10 }).map((_, i) => ({ episode_number: i + 1, name: `Episode ${i + 1}`, overview: '' })) };
        }
    } catch {
        notFound();
    }

    const year = formatYear(show.first_air_date);
    const similar = show.similar?.results || [];
    const seasons = show.seasons?.filter(s => s.season_number > 0) || [];
    const currentEpisode = seasonDetails?.episodes?.find((e: any) => e.episode_number === episodeNumber);

    // Find the first logo in English or null language
    const logo = (show as any).images?.logos?.find(
        (img: any) => img.iso_639_1 === 'en' || img.iso_639_1 === null
    );

    return (
        <div className="relative min-h-screen bg-background">
            {/* Backdrop Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60 z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent z-10" />
                {show.backdrop_path && (
                    <Image
                        src={getImageUrl(show.backdrop_path, 'original', 'backdrop')}
                        alt={show.name}
                        fill
                        className="object-cover opacity-30"
                        priority
                    />
                )}
            </div>

            <div className="relative z-20 pt-20 pb-16">
                <div className="container mx-auto px-4 md:px-8">
                    {/* Back Button */}
                    <Link href={`/tv/${show.id}`}>
                        <Button variant="ghost" className="mb-6 hover:bg-white/10" leftIcon={<ArrowLeft className="w-4 h-4 text-white" />}>
                            Back to Details
                        </Button>
                    </Link>

                    {/* Content Layout */}
                    <div className="max-w-7xl mx-auto">
                        {/* Player Wrapper */}
                        <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black mb-8">
                            <PlayerEmbed
                                tmdbId={show.id}
                                type="tv"
                                season={seasonNumber}
                                episode={episodeNumber}
                                className="h-full"
                                description={currentEpisode?.overview || show.overview}
                            />
                        </div>

                        {/* Header & Info */}
                        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
                            <div className="space-y-6">
                                {/* Branding & Title */}
                                <div>
                                    {logo ? (
                                        <div className="relative h-20 w-56 mb-4">
                                            <Image
                                                src={getImageUrl(logo.file_path, 'medium', 'logo')}
                                                alt={show.name}
                                                fill
                                                className="object-contain object-left"
                                            />
                                        </div>
                                    ) : (
                                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                            {show.name}
                                        </h1>
                                    )}
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-2xl text-accent-primary font-medium">S{seasonNumber} E{episodeNumber}</span>
                                        {currentEpisode?.name && (
                                            <span className="text-xl text-text-muted font-normal">
                                                - {currentEpisode.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-text-secondary">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-md text-white">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold">{show.vote_average.toFixed(1)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        <span>{year}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Tv className="w-4 h-4" />
                                        <span>{show.number_of_seasons} Seasons</span>
                                    </div>
                                </div>

                                <p className="text-text-secondary text-lg leading-relaxed max-w-4xl">
                                    {currentEpisode?.overview || show.overview}
                                </p>
                            </div>
                        </div>

                        {/* Season & Episode Selector */}
                        <div className="mt-12 grid lg:grid-cols-[250px_1fr] gap-8">
                            {/* Season Selector */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white sticky top-24">Seasons</h3>
                                <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                    {seasons.map((s) => (
                                        <Link
                                            key={s.id}
                                            href={`/tv/${show.id}/watch?season=${s.season_number}&episode=1`}
                                            className={`block w-full text-left px-4 py-3 rounded-lg transition-all ${s.season_number === seasonNumber
                                                ? 'bg-accent-primary text-white font-medium shadow-lg shadow-accent-primary/20'
                                                : 'bg-background-card text-text-secondary hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span>Season {s.season_number}</span>
                                                <span className="text-xs opacity-60 bg-white/10 px-1.5 py-0.5 rounded">{s.episode_count}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Episode List */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Episodes</h3>
                                <div className="grid gap-3">
                                    {seasonDetails.episodes?.map((ep: any) => (
                                        <Link
                                            key={ep.id}
                                            href={`/tv/${show.id}/watch?season=${seasonNumber}&episode=${ep.episode_number}`}
                                            className={`flex gap-4 p-3 rounded-xl transition-all group ${ep.episode_number === episodeNumber
                                                ? 'bg-white/10 border border-accent-primary/50'
                                                : 'bg-background-card border border-transparent hover:border-white/10 hover:bg-white/5'
                                                }`}
                                        >
                                            {/* Episode Thumbnail */}
                                            <div className="relative w-40 h-24 flex-shrink-0 bg-background-secondary rounded-lg overflow-hidden hidden sm:block">
                                                {ep.still_path ? (
                                                    <Image
                                                        src={getImageUrl(ep.still_path, 'small', 'backdrop')}
                                                        alt={ep.name}
                                                        fill
                                                        className="object-cover transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                                                        <Tv className="w-6 h-6" />
                                                    </div>
                                                )}
                                                {/* Playing Indicator */}
                                                {ep.episode_number === episodeNumber && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <div className="w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center animate-pulse shadow-lg shadow-accent-primary/50">
                                                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Episode Details */}
                                            <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
                                                <div className="flex items-start justify-between gap-4 mb-1">
                                                    <h4 className={`font-medium text-base truncate pr-2 ${ep.episode_number === episodeNumber ? 'text-accent-primary' : 'text-white group-hover:text-accent-primary transition-colors'}`}>
                                                        {ep.episode_number}. {ep.name}
                                                    </h4>
                                                    <span className="text-xs text-text-secondary whitespace-nowrap bg-white/5 px-2 py-1 rounded">
                                                        {ep.runtime ? `${ep.runtime}m` : 'N/A'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
                                                    {ep.overview || 'No description available.'}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
