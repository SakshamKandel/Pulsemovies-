'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    UserCircle,
    List,
    History,
    ChevronLeft,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/profiles', label: 'Profiles', icon: UserCircle },
    { href: '/admin/watchlist', label: 'Watchlist', icon: List },
    { href: '/admin/history', label: 'History', icon: History },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0A0A0A] border-r border-white/[0.05] flex flex-col z-50">
            {/* Header */}
            <div className="p-5 border-b border-white/[0.05]">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-accent-primary" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white text-sm">Pulse Admin</h2>
                        <p className="text-[10px] text-text-muted">Control Panel</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname?.startsWith(item.href) && item.href !== '/admin';
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
                                'hover:bg-white/[0.05]',
                                isActive ? 'bg-white/[0.05] text-white' : 'text-text-secondary'
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebarIndicator"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-primary rounded-r"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                                />
                            )}
                            <Icon className={cn(
                                'w-4 h-4',
                                isActive ? 'text-accent-primary' : 'text-text-muted'
                            )} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-white/[0.05]">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:text-white hover:bg-white/[0.05] transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Site</span>
                </Link>
            </div>
        </aside>
    );
}
