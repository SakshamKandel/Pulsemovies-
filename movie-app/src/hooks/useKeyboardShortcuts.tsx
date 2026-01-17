'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/useUIStore';

export function useKeyboardShortcuts() {
    const router = useRouter();
    const { setSearchOpen, isSearchOpen } = useUIStore();

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if typing in an input or textarea
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                // Only allow Escape in inputs
                if (e.key === 'Escape') {
                    setSearchOpen(false);
                    (target as HTMLInputElement).blur();
                }
                return;
            }

            // Keyboard shortcuts
            switch (e.key) {
                case '/':
                    e.preventDefault();
                    setSearchOpen(true);
                    break;
                case 'Escape':
                    setSearchOpen(false);
                    break;
                case 'h':
                case 'H':
                    if (!e.ctrlKey && !e.metaKey) {
                        router.push('/');
                    }
                    break;
                case 'm':
                case 'M':
                    if (!e.ctrlKey && !e.metaKey) {
                        router.push('/my-list');
                    }
                    break;
                case 's':
                case 'S':
                    if (!e.ctrlKey && !e.metaKey) {
                        router.push('/shorts');
                    }
                    break;
                case 'w':
                case 'W':
                    if (!e.ctrlKey && !e.metaKey) {
                        router.push('/history');
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router, setSearchOpen, isSearchOpen]);
}

// Wrapper component to use in layout
export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
    useKeyboardShortcuts();
    return <>{children}</>;
}
