'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users, UserCircle, List, History, Clock,
    Film, Tv, Eye, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
    stats: {
        totalUsers: number;
        totalProfiles: number;
        totalWatchlistItems: number;
        totalWatchHistory: number;
        newUsersLast7Days: number;
        avgProfilesPerUser: number;
    };
    usersByRole: Record<string, number>;
    recentActivity: Array<{
        id: string;
        title: string;
        mediaType: string;
        progress: number;
        updatedAt: string;
        profileName: string;
        userEmail: string;
        userName: string;
    }>;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (!res.ok) throw new Error('Failed to fetch stats');
            const data = await res.json();
            setData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse space-y-1">
                    <div className="h-7 w-40 bg-white/5 rounded" />
                    <div className="h-4 w-28 bg-white/5 rounded" />
                </div>
                <div className="grid grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-2 animate-pulse">
                            <div className="h-4 w-16 bg-white/5 rounded" />
                            <div className="h-8 w-12 bg-white/5 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-center">
                    <p className="text-text-muted mb-3">{error || 'Unable to load'}</p>
                    <button onClick={fetchStats} className="text-sm text-accent-primary hover:underline">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
                <p className="text-text-muted text-sm mt-1">Platform overview</p>
            </motion.div>

            {/* Stats - Clean inline */}
            <motion.div variants={itemVariants} className="flex items-end gap-12">
                <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Users</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-light text-white">{data.stats.totalUsers}</span>
                        {data.stats.newUsersLast7Days > 0 && (
                            <span className="text-xs text-green-400">+{data.stats.newUsersLast7Days} this week</span>
                        )}
                    </div>
                </div>
                <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Profiles</p>
                    <span className="text-3xl font-light text-white">{data.stats.totalProfiles}</span>
                </div>
                <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Watchlist</p>
                    <span className="text-3xl font-light text-white">{data.stats.totalWatchlistItems}</span>
                </div>
                <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-1">History</p>
                    <span className="text-3xl font-light text-white">{data.stats.totalWatchHistory}</span>
                </div>
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="h-px bg-white/5" />

            {/* Quick Navigation */}
            <motion.div variants={itemVariants}>
                <div className="flex items-center gap-6">
                    <Link href="/admin/users" className="group flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Users</span>
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                    <Link href="/admin/profiles" className="group flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
                        <UserCircle className="w-4 h-4" />
                        <span className="text-sm">Profiles</span>
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                    <Link href="/admin/watchlist" className="group flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
                        <List className="w-4 h-4" />
                        <span className="text-sm">Watchlist</span>
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                    <Link href="/admin/history" className="group flex items-center gap-2 text-text-secondary hover:text-white transition-colors">
                        <History className="w-4 h-4" />
                        <span className="text-sm">History</span>
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                </div>
            </motion.div>

            {/* Activity Section */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-text-muted" />
                        <h2 className="text-sm font-medium text-white">Recent Activity</h2>
                    </div>
                    <Link href="/admin/history" className="text-xs text-text-muted hover:text-white transition-colors">
                        View all
                    </Link>
                </div>

                <div className="space-y-1">
                    {data.recentActivity.length === 0 ? (
                        <div className="py-8 text-center">
                            <Eye className="w-6 h-6 text-text-muted mx-auto mb-2 opacity-40" />
                            <p className="text-text-muted text-sm">No activity yet</p>
                        </div>
                    ) : (
                        data.recentActivity.slice(0, 8).map((activity, index) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex items-center gap-4 py-3 border-b border-white/[0.03] last:border-0"
                            >
                                <div className={`w-7 h-7 rounded flex items-center justify-center ${activity.mediaType === 'movie'
                                        ? 'bg-blue-500/10 text-blue-400'
                                        : 'bg-purple-500/10 text-purple-400'
                                    }`}>
                                    {activity.mediaType === 'movie' ? <Film className="w-3.5 h-3.5" /> : <Tv className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{activity.title}</p>
                                    <p className="text-xs text-text-muted">{activity.profileName}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-20">
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-accent-primary/50 rounded-full"
                                                style={{ width: `${Math.min(activity.progress * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs text-text-muted w-8 text-right">{Math.round(activity.progress * 100)}%</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>

            {/* User Roles - Inline display */}
            <motion.div variants={itemVariants} className="flex items-center gap-8 pt-4">
                <span className="text-xs text-text-muted uppercase tracking-wider">Roles</span>
                {Object.entries(data.usersByRole).map(([role, count]) => (
                    <div key={role} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${role === 'SUPER_ADMIN' ? 'bg-red-400' :
                                role === 'ADMIN' ? 'bg-yellow-400' : 'bg-green-400'
                            }`} />
                        <span className="text-sm text-text-secondary">{role}</span>
                        <span className="text-sm text-white">{count}</span>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}
