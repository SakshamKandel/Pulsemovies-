'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Calendar, Shield, User, List, History } from 'lucide-react';
import Link from 'next/link';

interface UserDetails {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    role: string;
    createdAt: string;
    updatedAt: string;
    profiles: Array<{
        id: string;
        name: string;
        avatar: string | null;
        watchlist: Array<{
            id: string;
            title: string;
            mediaType: string;
            posterPath: string | null;
        }>;
        watchHistory: Array<{
            id: string;
            title: string;
            mediaType: string;
            progress: number;
        }>;
        _count: {
            watchlist: number;
            watchHistory: number;
        };
    }>;
}

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUser();
    }, [params.id]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/admin/users/${params.id}`);
            if (!res.ok) throw new Error('Failed to fetch user');
            const data = await res.json();
            setUser(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-8 w-32 bg-border/50 rounded" />
                <div className="h-48 bg-border/30 rounded-2xl" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error || 'User not found'}</p>
                <button onClick={() => router.back()} className="text-accent-primary hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">{user.name || 'Unnamed User'}</h1>
                    <p className="text-text-muted">{user.email}</p>
                </div>
            </div>

            {/* User Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background-card border border-border rounded-2xl p-6"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-accent-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-text-muted">Email</p>
                            <p className="text-white truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-accent-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-text-muted">Role</p>
                            <p className={`${user.role === 'SUPER_ADMIN' ? 'text-red-400' :
                                    user.role === 'ADMIN' ? 'text-yellow-400' : 'text-green-400'
                                }`}>{user.role}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-accent-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-text-muted">Profiles</p>
                            <p className="text-white">{user.profiles.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-accent-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-text-muted">Joined</p>
                            <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Profiles */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Profiles ({user.profiles.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.profiles.map((profile, index) => (
                        <motion.div
                            key={profile.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-background-card border border-border rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-xl font-bold text-white">
                                    {profile.name[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{profile.name}</h3>
                                    <p className="text-xs text-text-muted">ID: {profile.id.slice(0, 8)}...</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 p-3 bg-background rounded-xl">
                                    <List className="w-4 h-4 text-accent-primary" />
                                    <div>
                                        <p className="text-lg font-bold text-white">{profile._count.watchlist}</p>
                                        <p className="text-xs text-text-muted">Watchlist</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-background rounded-xl">
                                    <History className="w-4 h-4 text-accent-primary" />
                                    <div>
                                        <p className="text-lg font-bold text-white">{profile._count.watchHistory}</p>
                                        <p className="text-xs text-text-muted">History</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent items preview */}
                            {profile.watchHistory.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <p className="text-xs text-text-muted mb-2">Recent Watch</p>
                                    <div className="space-y-2">
                                        {profile.watchHistory.slice(0, 2).map(item => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <span className="text-sm text-text-secondary truncate flex-1">
                                                    {item.title}
                                                </span>
                                                <span className="text-xs text-accent-primary ml-2">
                                                    {Math.round(item.progress * 100)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
