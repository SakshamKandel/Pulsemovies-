'use client';

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, Clock, Calendar, Play, Share2, Plus, Check, Volume2 } from 'lucide-react';
import { getMovieDetails } from '@/lib/tmdb';
import { formatRuntime, formatYear, getImageUrl } from '@/lib/utils';
import { PlayerEmbed } from '@/components/player/VidKingEmbed';
import { MovieCarousel } from '@/components/movie/MovieCarousel';
import { Button } from '@/components/ui/Button';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import type { Metadata } from 'next';
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
        <div className="relative min-h-screen bg-background">
            {/* Enhanced Backdrop with multiple gradients */}
            <div className="fixed inset-0 z-0">
                {movie.backdrop_path && (
                    <Image
                        src={getImageUrl(movie.backdrop_path, 'original', 'backdrop')}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        priority
                    />
                )}
                {/* Layered gradients for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
                <div className="absolute inset-0 bg-background/60" />
            </div>

            <div className="relative z-20 pt-20 pb-16">
                <div className="container mx-auto px-4 md:px-8">
                    {/* Back Button with glassmorphism */}
                    <Link href={`/movie/${movie.id}`}>
                        <Button
                            variant="ghost"
                            className="mb-8 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-5"
                            leftIcon={<ArrowLeft className="w-4 h-4 text-white" />}
                        >
                            Back to Details
                        </Button>
                    </Link>

                    {/* Main Content Grid */}
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_380px] gap-10">
                        {/* Left Column: Player and Info */}
                        <div className="space-y-8">
                            {/* Premium Player Container */}
                            <div className="relative group">
                                {/* Glow effect behind player */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary/20 via-purple-500/20 to-accent-primary/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

                                <div className="relative aspect-video rounded-2xl overflow-hidden ring-1 ring-white/20 bg-black shadow-2xl">
                                    <PlayerEmbed tmdbId={movie.id} type="movie" />
                                </div>
                            </div>

                            {/* Movie Info Section */}
                            <div className="space-y-6">
                                {/* Logo or Title */}
                                {logo ? (
                                    <div className="relative h-24 md:h-32 w-64 md:w-80">
                                        <Image
                                            src={getImageUrl(logo.file_path, 'original', 'logo')}
                                            alt={movie.title}
                                            fill
                                            className="object-contain object-left drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                                            priority
                                        />
                                    </div>
                                ) : (
                                    <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                                        {movie.title}
                                    </h1>
                                )}

                                {/* Meta Info Pills */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Rating - highlighted */}
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        <span className="text-lg font-bold text-white">{movie.vote_average.toFixed(1)}</span>
                                    </div>

                                    {/* Year */}
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                        <Calendar className="w-4 h-4 text-text-secondary" />
                                        <span className="text-white font-medium">{year}</span>
                                    </div>

                                    {/* Runtime */}
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                        <Clock className="w-4 h-4 text-text-secondary" />
                                        <span className="text-white font-medium">{runtime}</span>
                                    </div>

                                    {/* Genres */}
                                    <div className="flex flex-wrap gap-2 ml-2">
                                        {movie.genres.slice(0, 3).map((genre) => (
                                            <Link
                                                key={genre.id}
                                                href={`/browse/movies?genre=${genre.id}`}
                                                className="px-4 py-2 text-sm font-medium text-text-secondary border border-white/20 rounded-xl hover:bg-accent-primary/20 hover:border-accent-primary/50 hover:text-white transition-all duration-300"
                                            >
                                                {genre.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-4 pt-2">
                                    <button
                                        onClick={handleWatchlistToggle}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${inWatchlist
                                                ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/30'
                                                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                            }`}
                                    >
                                        {inWatchlist ? (
                                            <>
                                                <Check className="w-5 h-5" />
                                                In My List
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5" />
                                                Add to List
                                            </>
                                        )}
                                    </button>

                                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 border border-white/20 transition-all duration-300">
                                        <Share2 className="w-5 h-5" />
                                        Share
                                    </button>
                                </div>

                                {/* Overview */}
                                <div className="pt-4">
                                    <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
                                    <p className="text-text-secondary text-base md:text-lg leading-relaxed max-w-4xl">
                                        {movie.overview}
                                    </p>
                                </div>

                                {/* Tagline if exists */}
                                {movie.tagline && (
                                    <p className="text-accent-primary italic text-lg font-medium border-l-2 border-accent-primary pl-4">
                                        "{movie.tagline}"
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Sidebar: More Like This */}
                        <div className="hidden lg:block">
                            <div className="sticky top-24 space-y-6">
                                {/* Section Header */}
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-gradient-to-b from-accent-primary to-purple-500 rounded-full" />
                                    <h3 className="text-xl font-bold text-white">More Like This</h3>
                                </div>

                                {/* Similar Movies List */}
                                <div className="flex flex-col gap-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar pr-2">
                                    {similar.slice(0, 8).map((item: any, index: number) => (
                                        <Link
                                            key={item.id}
                                            href={`/movie/${item.id}/watch`}
                                            className="group relative flex gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-primary/30 transition-all duration-300 backdrop-blur-sm"
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative w-28 h-[70px] flex-shrink-0 rounded-xl overflow-hidden bg-background-card">
                                                {item.backdrop_path ? (
                                                    <>
                                                        <Image
                                                            src={getImageUrl(item.backdrop_path, 'small', 'backdrop')}
                                                            alt={item.title}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        {/* Play overlay on hover */}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <div className="w-10 h-10 rounded-full bg-accent-primary/90 flex items-center justify-center shadow-lg">
                                                                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                                                        <Play className="w-6 h-6 text-text-muted" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                                                <h4 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-accent-primary transition-colors leading-snug">
                                                    {item.title}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-yellow-400 font-medium">{item.vote_average.toFixed(1)}</span>
                                                    </div>
                                                    <span className="text-text-muted text-xs">{formatYear(item.release_date)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* View More Link */}
                                <Link
                                    href={`/browse/movies?similar=${movie.id}`}
                                    className="block text-center py-3 text-accent-primary hover:text-white font-medium hover:bg-accent-primary/20 rounded-xl transition-all duration-300 border border-accent-primary/30"
                                >
                                    View More Recommendations
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Similar Movies */}
                    <div className="mt-16 lg:hidden">
                        <MovieCarousel title="More Like This" items={similar} />
                    </div>
                </div>
            </div>
        </div>
    );
}
