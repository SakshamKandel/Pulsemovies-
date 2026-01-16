'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, Clock, Calendar, Play, Plus, Check } from 'lucide-react';
import { formatRuntime, formatYear, getImageUrl } from '@/lib/utils';
import { PlayerEmbed } from '@/components/player/VidKingEmbed';
import { MovieCarousel } from '@/components/movie/MovieCarousel';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import type { MovieDetails, Movie } from '@/types/movie';
import * as React from 'react';

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

    const handleWatchlistToggle = () => {
        if (inWatchlist) {
            removeFromWatchlist(movie.id);
        } else {
            addToWatchlist(movie as any);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Simple Dark Background */}
            <div className="fixed inset-0 z-0 bg-[#0a0a0f]" />

            <div className="relative z-10 pt-20 pb-16">
                <div className="container mx-auto px-4 md:px-8">
                    {/* Back Button - Simple */}
                    <Link
                        href={`/movie/${movie.id}`}
                        className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Details</span>
                    </Link>

                    {/* Main Content Grid */}
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_340px] gap-8">
                        {/* Left Column: Player and Info */}
                        <div className="space-y-6">
                            {/* Clean Player Container */}
                            <div className="aspect-video rounded-lg overflow-hidden bg-black">
                                <PlayerEmbed tmdbId={movie.id} type="movie" />
                            </div>

                            {/* Movie Info Section */}
                            <div className="space-y-5">
                                {/* Logo or Title */}
                                {logo ? (
                                    <div className="relative h-20 md:h-24 w-56 md:w-72">
                                        <Image
                                            src={getImageUrl(logo.file_path, 'original', 'logo')}
                                            alt={movie.title}
                                            fill
                                            className="object-contain object-left"
                                            priority
                                        />
                                    </div>
                                ) : (
                                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                                        {movie.title}
                                    </h1>
                                )}

                                {/* Meta Info - Clean inline style */}
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                    {/* Rating */}
                                    <div className="flex items-center gap-1.5 text-yellow-400">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                                    </div>

                                    {/* Year */}
                                    <div className="flex items-center gap-1.5 text-text-secondary">
                                        <Calendar className="w-4 h-4" />
                                        <span>{year}</span>
                                    </div>

                                    {/* Runtime */}
                                    <div className="flex items-center gap-1.5 text-text-secondary">
                                        <Clock className="w-4 h-4" />
                                        <span>{runtime}</span>
                                    </div>

                                    {/* Separator */}
                                    <span className="hidden md:inline text-text-muted">•</span>

                                    {/* Genres - Simple text */}
                                    <div className="flex flex-wrap gap-2">
                                        {movie.genres.slice(0, 3).map((genre, i) => (
                                            <span key={genre.id} className="text-text-secondary">
                                                {genre.name}{i < Math.min(movie.genres.length, 3) - 1 && ','}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Overview */}
                                <p className="text-text-secondary leading-relaxed max-w-3xl">
                                    {movie.overview}
                                </p>

                                {/* Action Button - Simple */}
                                <button
                                    onClick={handleWatchlistToggle}
                                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${inWatchlist
                                            ? 'bg-accent-primary text-white'
                                            : 'bg-white/10 text-white hover:bg-white/15'
                                        }`}
                                >
                                    {inWatchlist ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            In My List
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            Add to List
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Right Sidebar: More Like This */}
                        <div className="hidden lg:block">
                            <div className="sticky top-24">
                                {/* Section Header */}
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-1 h-5 bg-accent-primary rounded-full" />
                                    <h3 className="text-lg font-semibold text-white">More Like This</h3>
                                </div>

                                {/* Similar Movies List */}
                                <div className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar pr-1">
                                    {similar.slice(0, 8).map((item: any) => (
                                        <Link
                                            key={item.id}
                                            href={`/movie/${item.id}/watch`}
                                            className="group flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative w-24 h-14 flex-shrink-0 rounded-md overflow-hidden bg-background-card">
                                                {item.backdrop_path ? (
                                                    <>
                                                        <Image
                                                            src={getImageUrl(item.backdrop_path, 'small', 'backdrop')}
                                                            alt={item.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        {/* Play icon on hover */}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Play className="w-6 h-6 text-white fill-white" />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                                                        <Play className="w-5 h-5 text-text-muted" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h4 className="font-medium text-white text-sm line-clamp-1 group-hover:text-accent-primary transition-colors">
                                                    {item.title}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
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
                    </div>

                    {/* Mobile Similar Movies */}
                    <div className="mt-12 lg:hidden">
                        <MovieCarousel title="More Like This" items={similar} />
                    </div>
                </div>
            </div>
        </div>
    );
}
