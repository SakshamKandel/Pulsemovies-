'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
    User,
    LogOut,
    Bookmark,
    Clock,
    Settings,
    ChevronRight,
    Loader2
} from 'lucide-react';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [stats, setStats] = React.useState({ watchlist: 0, history: 0 });

    React.useEffect(() => {
        if (session?.user?.id) {
            // Fetch user stats
            fetch('/api/user/stats')
                .then(res => res.json())
                .then(data => {
                    if (data.watchlist !== undefined) {
                        setStats(data);
                    }
                })
                .catch(() => { });
        }
    }, [session?.user?.id]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 space-y-6">
                <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-xl font-bold text-white">Not signed in</h1>
                    <p className="text-gray-500 text-sm">Sign in to view your profile</p>
                </div>
                <Link
                    href="/login"
                    className="px-8 py-2.5 bg-white text-black font-semibold rounded hover:bg-gray-200 transition-colors"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12">
            <div className="container mx-auto px-4 md:px-8 max-w-4xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-900 flex-shrink-0">
                        {session.user?.image ? (
                            <Image
                                src={session.user.image.startsWith('data:') ? session.user.image : `/api/user/avatar?t=${Date.now()}`}
                                alt={session.user.name || 'User'}
                                width={96}
                                height={96}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-8 h-8 text-gray-600" />
                            </div>
                        )}
                    </div>

                    <div className="text-center md:text-left space-y-1">
                        <h1 className="text-3xl font-bold text-white">
                            {session.user?.name || 'User'}
                        </h1>
                        <p className="text-gray-500">{session.user?.email}</p>
                        <div className="pt-2">
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="text-sm text-red-400 hover:text-red-300 transition-colors font-medium flex items-center gap-2 mx-auto md:mx-0"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-12">
                    <div className="bg-[#121212] p-6 rounded-lg border border-white/[0.02]">
                        <div className="flex items-center gap-3 mb-2 text-gray-400">
                            <Bookmark className="w-4 h-4" />
                            <span className="text-sm font-medium">Watchlist</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.watchlist}</p>
                    </div>
                    <div className="bg-[#121212] p-6 rounded-lg border border-white/[0.02]">
                        <div className="flex items-center gap-3 mb-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">History</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.history}</p>
                    </div>
                </div>

                {/* Menu List */}
                <div className="space-y-1">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Library</h2>

                    <Link
                        href="/my-list"
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-white/[0.03] transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-white group-hover:text-white/90 transition-colors">My Watchlist</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-500 transition-colors" />
                    </Link>

                    <Link
                        href="/history"
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-white/[0.03] transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-white group-hover:text-white/90 transition-colors">Watch History</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-500 transition-colors" />
                    </Link>

                    <Link
                        href="/settings"
                        className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-white/[0.03] transition-colors group text-left"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-white group-hover:text-white/90 transition-colors">Settings</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-500 transition-colors" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
