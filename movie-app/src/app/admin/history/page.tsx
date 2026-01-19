'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trash2, Film, Tv } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import toast from 'react-hot-toast';

interface HistoryItem {
    id: string;
    tmdbId: number;
    mediaType: string;
    title: string;
    posterPath: string | null;
    progress: number;
    timestamp: string;
    updatedAt: string;
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

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: '20',
                ...(search && { search })
            });
            const res = await fetch(`/api/admin/history?${params}`);
            if (!res.ok) throw new Error('Failed to fetch history');
            const data = await res.json();
            setHistory(data.history);
            setPagination(data.pagination);
        } catch (err) {
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, search]);

    useEffect(() => {
        const debounce = setTimeout(fetchHistory, 300);
        return () => clearTimeout(debounce);
    }, [fetchHistory]);

    const handleDelete = async (item: HistoryItem) => {
        if (!confirm(`Remove "${item.title}" from watch history?`)) return;

        try {
            const res = await fetch(`/api/admin/history?id=${item.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('History item removed');
            fetchHistory();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const columns = [
        {
            key: 'title',
            header: 'Title',
            render: (item: HistoryItem) => (
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
            render: (item: HistoryItem) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.mediaType === 'movie' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                    {item.mediaType === 'movie' ? 'Movie' : 'TV'}
                </span>
            )
        },
        {
            key: 'progress',
            header: 'Progress',
            render: (item: HistoryItem) => (
                <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-border rounded-full overflow-hidden">
                        <div
                            className="h-full bg-accent-primary rounded-full transition-all"
                            style={{ width: `${Math.min(item.progress * 100, 100)}%` }}
                        />
                    </div>
                    <span className="text-xs text-text-secondary">{Math.round(item.progress * 100)}%</span>
                </div>
            )
        },
        {
            key: 'profile',
            header: 'Profile',
            render: (item: HistoryItem) => (
                <div>
                    <p className="text-white">{item.profileName}</p>
                    <p className="text-xs text-text-muted">{item.userEmail}</p>
                </div>
            )
        },
        {
            key: 'updatedAt',
            header: 'Last Watched',
            render: (item: HistoryItem) => new Date(item.updatedAt).toLocaleString()
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item: HistoryItem) => (
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
                <h1 className="text-3xl font-bold text-white mb-2">Watch History</h1>
                <p className="text-text-muted">View all watch history across all profiles - useful for debugging sync issues</p>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={history}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                onSearch={setSearch}
                searchPlaceholder="Search by title..."
                isLoading={loading}
            />
        </div>
    );
}
