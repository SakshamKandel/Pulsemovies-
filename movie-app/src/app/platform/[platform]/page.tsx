import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { MovieCard } from '@/components/movie/MovieCard';
import { PLATFORMS, type PlatformKey } from '@/config/platforms';
import {
    getTrendingMovies,
    getPopularMovies,
    getTrendingTV,
    getPopularTV,
    getTopRatedMovies,
    getUpcomingMovies
} from '@/lib/tmdb';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ platform: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { platform } = await params;
    const platformData = PLATFORMS[platform as PlatformKey];

    return {
        title: platformData?.name || 'Platform',
        description: `Browse ${platformData?.name || 'platform'} content`,
    };
}

export default async function PlatformPage({ params }: PageProps) {
    const { platform } = await params;
    const platformKey = platform as PlatformKey;
    const platformData = PLATFORMS[platformKey];

    if (!platformData) {
        notFound();
    }

    // Fetch content based on platform
    let movies, tvShows;

    switch (platformKey) {
        case 'netflix':
            [movies, tvShows] = await Promise.all([getTrendingMovies(), getTrendingTV()]);
            break;
        case 'disney':
            [movies, tvShows] = await Promise.all([getPopularMovies(), getPopularTV()]);
            break;
        case 'prime':
            [movies, tvShows] = await Promise.all([getTopRatedMovies(), getPopularTV()]);
            break;
        case 'paramount':
            [movies, tvShows] = await Promise.all([getUpcomingMovies(), getTrendingTV()]);
            break;
        default:
            [movies, tvShows] = await Promise.all([getPopularMovies(), getPopularTV()]);
    }

    const moviesList = movies.results.slice(0, 18);
    const tvList = tvShows.results.slice(0, 12);

    return (
        <div
            className="min-h-screen"
            style={{
                background: `linear-gradient(180deg, ${platformData.accentColor}15 0%, ${platformData.bgColor} 30%, #0D0D0D 100%)`,
            }}
        >
            {/* Themed Header */}
            <div className="pt-24 pb-12">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="flex items-center gap-5">
                        <Link
                            href="/"
                            className="p-2.5 rounded-full transition-colors"
                            style={{
                                background: `${platformData.accentColor}20`,
                                color: platformData.accentColor,
                            }}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-4">
                            <Image
                                src={platformData.logo}
                                alt={platformData.name}
                                width={160}
                                height={48}
                                className={`h-12 w-auto object-contain ${platformKey === 'paramount' ? 'brightness-0 invert' : ''}`}
                            />
                            <div
                                className="h-6 w-px opacity-30"
                                style={{ backgroundColor: platformData.accentColor }}
                            />
                            <span className="text-text-secondary text-sm">Originals & Exclusives</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Themed accent bar */}
            <div
                className="h-px opacity-20 mb-8"
                style={{
                    background: `linear-gradient(90deg, transparent, ${platformData.accentColor}, transparent)`
                }}
            />

            {/* Content */}
            <div className="container mx-auto px-4 md:px-8 pb-16 space-y-14">
                {/* Movies Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="w-1 h-6 rounded-full"
                            style={{ backgroundColor: platformData.accentColor }}
                        />
                        <h2 className="text-xl font-semibold text-white">Movies</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {moviesList.map((item, index) => (
                            <MovieCard key={item.id} item={item} index={index} />
                        ))}
                    </div>
                </section>

                {/* TV Shows Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="w-1 h-6 rounded-full"
                            style={{ backgroundColor: platformData.accentColor }}
                        />
                        <h2 className="text-xl font-semibold text-white">TV Shows</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {tvList.map((item, index) => (
                            <MovieCard key={item.id} item={item} index={index} />
                        ))}
                    </div>
                </section>
            </div>

            {/* Bottom gradient fade to main bg */}
            <div
                className="h-32"
                style={{
                    background: `linear-gradient(to bottom, transparent, #0D0D0D)`,
                }}
            />
        </div>
    );
}
