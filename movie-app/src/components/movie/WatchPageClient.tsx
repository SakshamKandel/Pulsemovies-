'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, Play, Plus, Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatRuntime, formatYear, getImageUrl } from '@/lib/utils';
import { PlayerEmbed } from '@/components/player/VidKingEmbed';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import type { MovieDetails, Movie } from '@/types/movie';
import { TrailerRail } from '@/components/movie/TrailerRail';
import { useTrailer } from '@/components/movie/TrailerProvider';
import { useProfile } from '@/context/ProfileContext';

interface WatchPageClientProps {
    movie: MovieDetails;
    similar: Movie[];
    logo: { file_path: string } | null;
}

export function WatchPageClient({ movie, similar, logo }: WatchPageClientProps) {
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
    const { currentProfile } = useProfile();
    const inWatchlist = isInWatchlist(movie.id);

    const year = formatYear(movie.release_date);
    const runtime = formatRuntime(movie.runtime);
    const openTrailer = useTrailer();
    const [theater, setTheater] = React.useState(true);
    const cast = movie.credits?.cast.slice(0, 15) || [];

    const handleWatchlistToggle = () => {
        if (inWatchlist) {
            removeFromWatchlist(movie.id, currentProfile?.id);
        } else {
            addToWatchlist(movie, currentProfile?.id);
        }
    };

    return (
        <div className="watch-cinema min-h-screen bg-black text-white selection:bg-accent-primary/30 pt-16">

            {/* Main Content Area */}
            <div className="w-full pb-12">

                {/* Back Button */}
                <div className="watch-navigation flex items-center justify-between gap-4 px-4 md:px-8">
                    <Link
                        href={`/movie/${movie.id}`}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm">{movie.title}</span>
                    </Link>
                    <button className="text-xs text-zinc-400" aria-pressed={theater} onClick={() => setTheater(!theater)}>{theater ? 'Compact view' : 'Cinema view'}</button>
                </div>

                <div className={`grid grid-cols-1 gap-8 ${theater ? "" : "lg:grid-cols-12"}`}>

                    {/* Left Column: Player & Info (Width: 9/12) */}
                    <div className={`${theater ? "" : "lg:col-span-8"} min-w-0 space-y-8`}>

                        {/* Player Container */}
                        <div className="watch-stage overflow-hidden">

                            <PlayerEmbed
                                tmdbId={movie.id}
                                type="movie"
                                movieTitle={movie.title}
                                posterPath={movie.poster_path || undefined}
                            />
                        </div>

                        {/* Movie Information */}
                        <div className="watch-story relative isolate px-5 md:px-12 py-12 md:py-20 space-y-6">
                            {movie.backdrop_path && <div className="absolute inset-0 -z-10 pointer-events-none"><Image src={getImageUrl(movie.backdrop_path, 'original', 'backdrop')} alt="" fill sizes="100vw" className="object-cover object-top" /><div className="absolute inset-0 watch-story-fade" /></div>}
                            {/* Header: Logo/Title & Actions */}
                            <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                                <div className="space-y-4 flex-1">
                                    {logo ? (
                                        <div className="relative h-20 w-64 md:h-24 md:w-80">
                                            <Image
                                                src={getImageUrl(logo.file_path, 'original', 'logo')}
                                                alt={movie.title}
                                                fill
                                                className="object-contain object-left"
                                                priority
                                            />
                                        </div>
                                    ) : (
                                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                                            {movie.title}
                                        </h1>
                                    )}

                                    {/* Metadata Row */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                                        <div className="flex items-center gap-1.5 text-yellow-400 font-medium">
                                            <Star className="w-4 h-4 fill-current" />
                                            {movie.vote_average.toFixed(1)}
                                        </div>
                                        <span>{year}</span>
                                        <span>{runtime}</span>
                                        <div className="flex gap-2">
                                            {movie.genres.slice(0, 3).map(g => (
                                                <Badge key={g.id} variant="default" className="bg-transparent border-white/10 hover:bg-white/5 text-gray-300">
                                                    {g.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex-shrink-0">
                                    <button
                                        onClick={handleWatchlistToggle}
                                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all w-full md:w-auto ${inWatchlist
                                            ? 'bg-accent-primary text-white hover:bg-accent-hover'
                                            : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                    >
                                        {inWatchlist ? (
                                            <>
                                                <Check className="w-5 h-5" /> In Watchlist
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5" /> Add to Watchlist
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button onClick={() => openTrailer({ id: movie.id, title: movie.title, type: 'movie' })} className="inline-flex items-center gap-2 text-sm text-violet-300"><Play size={16} /> Watch trailer</button>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                {[['Released', year], ['Runtime', runtime || 'Not listed'], ['Language', movie.original_language?.toUpperCase()], ['Rating', `${movie.vote_average.toFixed(1)} / 10`]].map(([label, value]) => <div key={label} className="border-l border-white/20 pl-4 py-1"><p className="text-xs text-zinc-500 mb-1">{label}</p><p>{value}</p></div>)}
                            </div>
                            <h2 className="text-lg">The story</h2>
                            {/* Overview */}
                            <p className="text-gray-300 text-lg leading-relaxed max-w-4xl">
                                {movie.overview}
                            </p>

                            {/* Cast Section */}
                            {cast.length > 0 && (
                                <div className="pt-6 border-t border-white/5">
                                    <h3 className="text-lg font-semibold text-white mb-4">Top Cast</h3>
                                    {/* Clean horizontal scroll for cast */}
                                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                        {cast.map((person) => (
                                            <div key={person.id} className="flex-shrink-0 w-28 text-center group">
                                                <div className="relative w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-transparent group-hover:border-accent-primary transition-colors bg-zinc-800">
                                                    {person.profile_path ? (
                                                        <Image
                                                            src={getImageUrl(person.profile_path, 'small', 'profile')}
                                                            alt={person.name}
                                                            fill
                                                            className="object-cover transition-transform group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                                            N/A
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-white truncate group-hover:text-accent-primary transition-colors">
                                                    {person.name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {person.character}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className={`${theater ? '' : 'lg:col-span-4'} min-w-0`}><TrailerRail items={similar} compact={!theater} /></aside>

                </div>
            </div>
        </div>
    );
}
