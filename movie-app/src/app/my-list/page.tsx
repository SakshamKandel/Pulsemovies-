'use client';

import * as React from 'react';
import { Trash2, ListX, Film, Tv, Star, LayoutGrid, List, Clock, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import { MovieCard } from '@/components/movie/MovieCard';
import { getImageUrl, formatYear, getContentTitle, getContentDate } from '@/lib/utils';

type FilterType = 'all' | 'movie' | 'tv';
type SortType = 'date' | 'name' | 'rating';
type ViewType = 'grid' | 'list';

export default function MyListPage() {
    const { items: watchlist, removeFromWatchlist, clearWatchlist } = useWatchlistStore();
    const [mounted, setMounted] = React.useState(false);
    const [filter, setFilter] = React.useState<FilterType>('all');
    const [sort, setSort] = React.useState<SortType>('date');
    const [view, setView] = React.useState<ViewType>('grid');

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Stats
    const movieCount = watchlist.filter(item => 'title' in item).length;
    const tvCount = watchlist.filter(item => 'name' in item && !('title' in item)).length;
    const totalCount = watchlist.length;

    // Filter and sort
    const filteredItems = React.useMemo(() => {
        let items = [...watchlist];

        if (filter === 'movie') {
            items = items.filter(item => 'title' in item);
        } else if (filter === 'tv') {
            items = items.filter(item => 'name' in item && !('title' in item));
        }

        items.sort((a, b) => {
            if (sort === 'date') return (b.addedAt || 0) - (a.addedAt || 0);
            if (sort === 'name') {
                const nameA = 'title' in a ? a.title : ('name' in a ? a.name : '');
                const nameB = 'title' in b ? b.title : ('name' in b ? b.name : '');
                return nameA.localeCompare(nameB);
            }
            if (sort === 'rating') return (b.vote_average || 0) - (a.vote_average || 0);
            return 0;
        });

        return items;
    }, [watchlist, filter, sort]);

    if (!mounted) {
        return (
            <div className="min-h-screen pt-24 pb-16 bg-[#0a0a0a]">
                <div className="container mx-auto px-4 md:px-8">
                    <div className="h-10 w-40 bg-white/5 rounded animate-pulse mb-8" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-[2/3] bg-white/5 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16 bg-[#0a0a0a]">
            <div className="container mx-auto px-4 md:px-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">My List</h1>
                    {totalCount > 0 && (
                        <button
                            onClick={clearWatchlist}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </button>
                    )}
                </div>

                {/* Stats Row - Clean flat design */}
                <div className="flex items-center gap-6 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                        <span className="text-white font-semibold text-lg">{totalCount}</span>
                        <span>Total</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2 text-gray-400">
                        <Film className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium">{movieCount}</span>
                        <span className="hidden sm:inline">Movies</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <Tv className="w-4 h-4 text-green-400" />
                        <span className="text-white font-medium">{tvCount}</span>
                        <span className="hidden sm:inline">TV Shows</span>
                    </div>
                </div>

                {/* Controls - Simple and flat */}
                {totalCount > 0 && (
                    <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
                        {/* Filter Pills */}
                        <div className="flex items-center gap-2">
                            {(['all', 'movie', 'tv'] as FilterType[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === f
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    {f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'TV'}
                                </button>
                            ))}
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-4">
                            {/* Sort */}
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value as SortType)}
                                className="bg-transparent text-sm text-gray-400 border border-white/10 rounded-md px-2 py-1.5 focus:outline-none focus:border-white/20"
                            >
                                <option value="date" className="bg-zinc-900">Date Added</option>
                                <option value="name" className="bg-zinc-900">Name</option>
                                <option value="rating" className="bg-zinc-900">Rating</option>
                            </select>

                            {/* View Toggle */}
                            <div className="flex items-center border border-white/10 rounded-md">
                                <button
                                    onClick={() => setView('grid')}
                                    className={`flex items-center justify-center w-8 h-8 transition-colors ${view === 'grid'
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <div className="w-px h-4 bg-white/10" />
                                <button
                                    onClick={() => setView('list')}
                                    className={`flex items-center justify-center w-8 h-8 transition-colors ${view === 'list'
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <ListX className="w-16 h-16 text-gray-700 mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">
                            {filter !== 'all' ? `No ${filter === 'movie' ? 'movies' : 'TV shows'}` : 'Your list is empty'}
                        </h2>
                        <p className="text-gray-500 max-w-sm mb-6">
                            Add movies and shows by clicking the bookmark icon on any title.
                        </p>
                        <Link
                            href="/browse"
                            className="px-5 py-2.5 bg-accent-primary hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Browse Content
                        </Link>
                    </div>
                ) : view === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredItems.map((item, index) => (
                            <div key={item.id} className="relative group">
                                <MovieCard item={item} index={index} />

                                {/* Remove Button - positioned below the card image */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeFromWatchlist(item.id);
                                    }}
                                    className="absolute top-1 left-1 p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all z-40"
                                    title="Remove from list"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List View - Clean and simple */
                    <div className="space-y-2">
                        {filteredItems.map((item) => {
                            const isMovie = 'title' in item;
                            const title = getContentTitle(item);
                            const year = formatYear(getContentDate(item));
                            const posterUrl = item.poster_path ? getImageUrl(item.poster_path, 'small', 'poster') : null;
                            const href = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;
                            const watchHref = isMovie ? `/movie/${item.id}/watch` : `/tv/${item.id}/watch`;

                            return (
                                <div
                                    key={item.id}
                                    className="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.03] transition-colors"
                                >
                                    {/* Poster */}
                                    <Link href={href} className="relative w-12 aspect-[2/3] rounded overflow-hidden flex-shrink-0">
                                        {posterUrl ? (
                                            <Image src={posterUrl} alt={title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                                <Film className="w-4 h-4 text-gray-600" />
                                            </div>
                                        )}
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={href} className="block">
                                            <h3 className="font-medium text-white truncate group-hover:text-accent-primary transition-colors">
                                                {title}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                            <span className={isMovie ? 'text-blue-400' : 'text-green-400'}>
                                                {isMovie ? 'Movie' : 'TV'}
                                            </span>
                                            <span>•</span>
                                            <span>{year}</span>
                                            {item.vote_average > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-0.5">
                                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                        {item.vote_average.toFixed(1)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <Link
                                            href={watchHref}
                                            className="flex items-center justify-center w-6 h-6 text-accent-primary hover:text-white transition-colors"
                                        >
                                            <Play className="w-5 h-5 fill-current" />
                                        </Link>
                                        <button
                                            onClick={() => removeFromWatchlist(item.id)}
                                            className="flex items-center justify-center w-6 h-6 text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
