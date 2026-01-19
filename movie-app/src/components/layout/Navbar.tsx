'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/lib/constants';
import { useUIStore } from '@/store/useUIStore';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/search/SearchBar';
import { UserMenu } from '@/components/auth/UserMenu';

export function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = React.useState(false);
    const {
        isMobileMenuOpen,
        toggleMobileMenu,
        setMobileMenuOpen,
        isSearchOpen,
        setSearchOpen
    } = useUIStore();

    // Handle scroll effect
    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    React.useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname, setMobileMenuOpen]);

    return (
        <>
            <header
                className={cn(
                    'fixed top-0 left-0 right-0 z-[100] transition-all duration-300',
                    scrolled || isMobileMenuOpen
                        ? 'bg-background border-b border-border'
                        : 'bg-gradient-to-b from-black/80 to-transparent'
                )}
            >
                <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative h-16 w-36 overflow-hidden flex items-center justify-center">
                            <Image
                                src="/images/logo.png"
                                alt="Pulse Movies"
                                width={160}
                                height={50}
                                className="object-contain scale-150"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8 mt-2">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'text-sm font-medium transition-colors hover:text-accent-primary',
                                    pathname === item.href
                                        ? 'text-accent-primary'
                                        : 'text-text-secondary'
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Section - Search Only */}
                    <div className="flex items-center gap-4">
                        {/* Search Button */}
                        <button
                            onClick={() => setSearchOpen(!isSearchOpen)}
                            className="flex items-center gap-2 h-9 px-4 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
                        >
                            <Search className="w-4 h-4 group-hover:text-accent-primary transition-colors" />
                            <span className="hidden sm:inline text-sm font-medium">Search</span>
                        </button>

                        {/* User Menu */}
                        <div className="hidden md:block">
                            <UserMenu />
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-full text-text-secondary hover:text-white hover:bg-background-card transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </nav>

                {/* Search Bar (Expandable) */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-border bg-background/95 backdrop-blur-lg"
                        >
                            <div className="container mx-auto px-4 py-4">
                                <SearchBar />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Mobile Menu - Full Screen Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[60] bg-background md:hidden flex flex-col"
                    >
                        {/* Header with close button */}
                        <div className="flex items-center justify-between px-4 h-16 border-b border-border">
                            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                                <Image
                                    src="/images/logo.png"
                                    alt="Pulse Movies"
                                    width={150}
                                    height={48}
                                    className="h-10 w-auto object-contain"
                                />
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 rounded-full bg-background-card text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 px-6 py-8 space-y-1">
                            {NAV_ITEMS.map((item, index) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            'flex items-center gap-4 py-4 px-4 rounded-xl text-xl font-medium transition-all',
                                            pathname === item.href
                                                ? 'bg-accent-primary text-white'
                                                : 'text-text-secondary hover:text-white hover:bg-background-card'
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>

                        {/* Bottom section */}
                        <div className="px-6 py-6 border-t border-border">
                            <p className="text-text-muted text-xs text-center">
                                © 2026 Pulsemovies
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
