'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trash2, Film, Tv } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import toast from 'react-hot-toast';

interface WatchlistItem {
    id: string;
    tmdbId: number;
    mediaType: string;
    title: string;
    posterPath: string | null;
    voteAverage: number;
    addedAt: string;
    profileName: string;
    profileId: string;
    userEmail: string;
    userName: string | null;
    userId: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchWatchlist = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: '20',
                ...(search && { search })
            });
            const res = await fetch(`/api/admin/watchlist?${params}`);
            if (!res.ok) throw new Error('Failed to fetch watchlist');
            const data = await res.json();
            setWatchlist(data.watchlist);
            setPagination(data.pagination);
        } catch (err) {
            toast.error('Failed to load watchlist');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, search]);

    useEffect(() => {
        const debounce = setTimeout(fetchWatchlist, 300);
        return () => clearTimeout(debounce);
    }, [fetchWatchlist]);

    const handleDelete = async (item: WatchlistItem) => {
        if (!confirm(`Remove "${item.title}" from watchlist?`)) return;

        try {
            const res = await fetch(`/api/admin/watchlist?id=${item.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Item removed');
            fetchWatchlist();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const columns = [
        {
            key: 'title',
            header: 'Title',
            render: (item: WatchlistItem) => (
                <div className="flex items-center gap-3">
                    {item.posterPath ? (
                        <img
                            src={`https://image.tmdb.org/t/p/w92${item.posterPath}`}
                            alt={item.title}
                            className="w-10 h-14 rounded object-cover"
                        />
                    ) : (
                        <div className="w-10 h-14 rounded bg-border flex items-center justify-center">
                            {item.mediaType === 'movie' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                        </div>
                    )}
                    <div>
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-xs text-text-muted">TMDB: {item.tmdbId}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'mediaType',
            header: 'Type',
            render: (item: WatchlistItem) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.mediaType === 'movie' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                    {item.mediaType === 'movie' ? 'Movie' : 'TV'}
                </span>
            )
        },
        {
            key: 'rating',
            header: 'Rating',
            render: (item: WatchlistItem) => (
                <span className="text-yellow-500">{item.voteAverage?.toFixed(1) || '-'}</span>
            )
        },
        {
            key: 'profile',
            header: 'Profile',
            render: (item: WatchlistItem) => (
                <div>
                    <p className="text-white">{item.profileName}</p>
                    <p className="text-xs text-text-muted">{item.userEmail}</p>
                </div>
            )
        },
        {
            key: 'addedAt',
            header: 'Added',
            render: (item: WatchlistItem) => new Date(item.addedAt).toLocaleDateString()
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item: WatchlistItem) => (
                <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4 text-text-muted hover:text-red-500" />
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Watchlist</h1>
                <p className="text-text-muted">View all watchlist items across all profiles</p>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={watchlist}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                onSearch={setSearch}
                searchPlaceholder="Search by title..."
                isLoading={loading}
            />
        </div>
    );
}
