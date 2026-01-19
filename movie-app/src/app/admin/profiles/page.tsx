'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import toast from 'react-hot-toast';

interface Profile {
    id: string;
    name: string;
    avatar: string | null;
    language: string;
    autoplay: boolean;
    createdAt: string;
    user: {
        id: string;
        email: string;
        name: string | null;
    };
    watchlistCount: number;
    watchHistoryCount: number;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function ProfilesPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: '20',
                ...(search && { search })
            });
            const res = await fetch(`/api/admin/profiles?${params}`);
            if (!res.ok) throw new Error('Failed to fetch profiles');
            const data = await res.json();
            setProfiles(data.profiles);
            setPagination(data.pagination);
        } catch (err) {
            toast.error('Failed to load profiles');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, search]);

    useEffect(() => {
        const debounce = setTimeout(fetchProfiles, 300);
        return () => clearTimeout(debounce);
    }, [fetchProfiles]);

    const handleDelete = async (profile: Profile) => {
        if (!confirm(`Delete profile "${profile.name}"? This will delete all their watchlist and history.`)) return;

        try {
            const res = await fetch(`/api/admin/profiles?id=${profile.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }
            toast.success('Profile deleted');
            fetchProfiles();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Profile',
            render: (profile: Profile) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-sm font-bold text-white">
                        {profile.name[0]?.toUpperCase()}
                    </div>
                    <span className="text-white">{profile.name}</span>
                </div>
            )
        },
        {
            key: 'user',
            header: 'User',
            render: (profile: Profile) => (
                <div>
                    <p className="text-white">{profile.user.name || '-'}</p>
                    <p className="text-xs text-text-muted">{profile.user.email}</p>
                </div>
            )
        },
        {
            key: 'watchlistCount',
            header: 'Watchlist',
            render: (profile: Profile) => (
                <span className="text-text-secondary">{profile.watchlistCount}</span>
            )
        },
        {
            key: 'watchHistoryCount',
            header: 'History',
            render: (profile: Profile) => (
                <span className="text-text-secondary">{profile.watchHistoryCount}</span>
            )
        },
        {
            key: 'createdAt',
            header: 'Created',
            render: (profile: Profile) => new Date(profile.createdAt).toLocaleDateString()
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (profile: Profile) => (
                <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(profile); }}
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
                <h1 className="text-3xl font-bold text-white mb-2">Profiles</h1>
                <p className="text-text-muted">View and manage all user profiles</p>
            </div>

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={profiles}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                onSearch={setSearch}
                searchPlaceholder="Search by profile or user email..."
                isLoading={loading}
            />
        </div>
    );
}
