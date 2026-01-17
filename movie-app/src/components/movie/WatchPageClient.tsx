'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, Calendar, Clock, Play, Plus, Check } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatRuntime, formatYear, getImageUrl } from '@/lib/utils';
import { PlayerEmbed } from '@/components/player/VidKingEmbed';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import type { MovieDetails, Movie } from '@/types/movie';
import { MovieCarousel } from '@/components/movie/MovieCarousel';

interface WatchPageClientProps {
    movie: MovieDetails;
    similar: Movie[];
    logo: { file_path: string } | null;
}

export function WatchPageClient({ movie, similar, logo }: WatchPageClientProps) {
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();
    const inWatchlist = isInWatchlist(movie.id);

    const year = formatYear(movie.release_date);
    const runtime = formatRuntime(movie.runtime);
    const cast = movie.credits?.cast.slice(0, 15) || [];

    const handleWatchlistToggle = () => {
        if (inWatchlist) {
            removeFromWatchlist(movie.id);
        } else {
            addToWatchlist(movie as any);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-accent-primary/30 pt-24 md:pt-28">

            {/* Main Content Area */}
            <main className="container mx-auto px-4 pb-12">

                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href={`/movie/${movie.id}`}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Details</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Column: Player & Info (Width: 9/12) */}
                    <div className="lg:col-span-9 space-y-8">

                        {/* Player Container */}
                        <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative">
                            <div className="aspect-video w-full">
                                <PlayerEmbed
                                    tmdbId={movie.id}
                                    type="movie"
                                    movieTitle={movie.title}
                                    posterPath={movie.poster_path || undefined}
                                />
                            </div>
                        </div>

                        {/* Movie Information */}
                        <div className="space-y-6">
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
                                                <Badge key={g.id} variant="outline" className="border-white/10 hover:bg-white/5 text-gray-300">
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

                    {/* Right Column: Sidebar (Width: 3/12) */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="sticky top-28">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-accent-primary rounded-full" />
                                More Like This
                            </h3>

                            {/* Scrollable list for Sidebar */}
                            <div className="space-y-3 max-h-[calc(100vh-150px)] overflow-y-auto custom-scrollbar pr-2">
                                {similar.slice(0, 10).map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/movie/${item.id}/watch`}
                                        className="flex gap-3 p-2 rounded-xl group hover:bg-white/5 transition-colors"
                                    >
                                        <div className="relative w-32 aspect-video bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.backdrop_path ? (
                                                <Image
                                                    src={getImageUrl(item.backdrop_path, 'small', 'backdrop')}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Play className="w-8 h-8 text-white/20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="text-sm font-medium text-white line-clamp-2 group-hover:text-accent-primary transition-colors">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                <span className="text-xs text-gray-400">{item.vote_average.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {similar.length === 0 && (
                                <div className="text-gray-500 text-sm">No similar movies available.</div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Only: Recommendation Carousel at bottom if needed */}
                    <div className="lg:hidden col-span-1 border-t border-white/5 pt-8">
                        <MovieCarousel title="You May Also Like" items={similar} />
                    </div>

                </div>
            </main>
        </div>
    );
}
