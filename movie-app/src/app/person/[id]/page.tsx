import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPersonDetails } from '@/lib/tmdb';
import { getImageUrl, formatDate } from '@/lib/utils';
import { MovieCard } from '@/components/movie/MovieCard';
import { MovieCardSkeleton } from '@/components/ui/Skeleton';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    try {
        const person = await getPersonDetails(parseInt(id));
        return {
            title: `${person.name} - Filmography`,
            description: person.biography?.slice(0, 160) || `View ${person.name}'s movies and TV shows.`,
        };
    } catch {
        return { title: 'Actor Profile' };
    }
}

export default async function PersonPage({ params }: Props) {
    const { id } = await params;

    let person;
    try {
        person = await getPersonDetails(parseInt(id));
    } catch {
        notFound();
    }

    const movieCredits = person.movie_credits?.cast || [];
    const tvCredits = person.tv_credits?.cast || [];

    // Sort by popularity and filter out items without posters
    const topMovies = movieCredits
        .filter((m: any) => m.poster_path)
        .sort((a: any, b: any) => b.popularity - a.popularity)
        .slice(0, 12);

    const topTV = tvCredits
        .filter((t: any) => t.poster_path)
        .sort((a: any, b: any) => b.popularity - a.popularity)
        .slice(0, 12);

    const profileUrl = getImageUrl(person.profile_path, 'large', 'profile');

    return (
        <div className="min-h-screen pt-20 pb-16">
            {/* Header Section */}
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                        <div className="relative w-48 md:w-64 aspect-[2/3] overflow-hidden bg-background-card">
                            {person.profile_path ? (
                                <Image
                                    src={profileUrl}
                                    alt={person.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-muted">
                                    No Image
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{person.name}</h1>

                        <div className="flex flex-wrap gap-4 text-sm text-text-muted mb-6">
                            {person.birthday && (
                                <span>Born: {formatDate(person.birthday)}</span>
                            )}
                            {person.place_of_birth && (
                                <span>{person.place_of_birth}</span>
                            )}
                            {person.known_for_department && (
                                <span className="px-2 py-0.5 bg-background-card border border-border text-xs uppercase tracking-wider">
                                    {person.known_for_department}
                                </span>
                            )}
                        </div>

                        {person.biography && (
                            <p className="text-text-secondary leading-relaxed line-clamp-6">
                                {person.biography}
                            </p>
                        )}
                    </div>
                </div>

                {/* Movies Section */}
                {topMovies.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-xl font-bold text-white mb-6">Movies</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {topMovies.map((movie: any, index: number) => (
                                <MovieCard
                                    key={`movie-${movie.id}-${index}`}
                                    item={{ ...movie, title: movie.title || movie.name }}
                                    index={index}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* TV Shows Section */}
                {topTV.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-xl font-bold text-white mb-6">TV Shows</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {topTV.map((show: any, index: number) => (
                                <MovieCard
                                    key={`tv-${show.id}-${index}`}
                                    item={{ ...show, name: show.name || show.title }}
                                    index={index}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
