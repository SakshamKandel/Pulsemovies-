'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Bookmark, Clock, Settings, Film, Shield } from 'lucide-react';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import { useContinueWatchingStore } from '@/store/useContinueWatchingStore';
import { useProfile } from '@/context/ProfileContext';

export function UserMenu() {
    const { data: session, status } = useSession();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isAdmin, setIsAdmin] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const { currentProfile, clearProfile } = useProfile();

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check admin status from database (not session cache)
    React.useEffect(() => {
        async function checkAdmin() {
            if (!session?.user) {
                setIsAdmin(false);
                return;
            }
            try {
                const res = await fetch('/api/admin/verify');
                const data = await res.json();
                setIsAdmin(res.ok && data.isAdmin === true);
            } catch {
                setIsAdmin(false);
            }
        }
        checkAdmin();
    }, [session]);

    if (status === 'loading') {
        return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />;
    }

    if (!session) {
        return (
            <Link
                href="/login"
                className="flex items-center h-9 px-5 text-sm font-medium text-white bg-accent-primary hover:bg-accent-hover rounded-full transition-colors shadow-lg shadow-accent-primary/10"
            >
                Sign In
            </Link>
        );
    }

    const displayName = currentProfile?.name || session.user?.name || 'User';
    const displayAvatar = currentProfile?.avatar || session.user?.image;
    const initials = displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 group"
            >
                {displayAvatar ? (
                    <Image
                        src={displayAvatar}
                        alt={displayName}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full border border-white/10 object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary text-xs font-medium">
                        {initials}
                    </div>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-2 w-56 p-2 bg-[#161616] border border-white/10 rounded-xl shadow-xl z-50"
                    >
                        {/* User Info */}
                        <div className="px-3 py-2 mb-2 border-b border-white/5">
                            <p className="text-sm font-medium text-white truncate">
                                {displayName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {session.user?.email}
                            </p>
                        </div>

                        {/* Links */}
                        <div className="space-y-1">
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <User className="w-4 h-4" />
                                Profile
                            </Link>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    clearProfile();
                                }}
                                className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <Film className="w-4 h-4" />
                                Change Profile
                            </button>
                            <Link
                                href="/my-list"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <Bookmark className="w-4 h-4" />
                                My Watchlist
                            </Link>
                            <Link
                                href="/history"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <Clock className="w-4 h-4" />
                                Watch History
                            </Link>
                            <Link
                                href="/settings"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>

                            {/* Admin Panel - Only visible to verified super admins from database */}
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors"
                                >
                                    <Shield className="w-4 h-4" />
                                    Admin Panel
                                </Link>
                            )}
                        </div>

                        {/* Sign Out */}
                        <div className="mt-2 pt-2 border-t border-white/5">
                            <button
                                onClick={async () => {
                                    useWatchlistStore.getState().clearWatchlist();
                                    useContinueWatchingStore.getState().clearAll();
                                    await signOut({ callbackUrl: '/' });
                                }}
                                className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
