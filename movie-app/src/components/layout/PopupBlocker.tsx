'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { installPopupBlocker } from '@/lib/popupBlocker';

export function PopupBlocker() {
    const pathname = usePathname();
    useEffect(() => {
        // Authentication/admin integrations may legitimately open their own windows.
        if (pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/admin')) return;
        return installPopupBlocker(window);
    }, [pathname]);
    return null;
}
