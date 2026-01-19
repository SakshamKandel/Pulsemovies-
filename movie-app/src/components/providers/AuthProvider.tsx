'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { useWatchlistStore } from '@/store/useWatchlistStore';
import { useContinueWatchingStore } from '@/store/useContinueWatchingStore';

interface AuthProviderProps {
    children: ReactNode;
}

function AuthSync({ children }: { children: ReactNode }) {
    const { status } = useSession();
    const syncWatchlist = useWatchlistStore((state) => state.syncWithDatabase);
    const syncHistory = useContinueWatchingStore((state) => state.syncWithDatabase);

    useEffect(() => {
        if (status === 'authenticated') {
            syncWatchlist();
            syncHistory();
        }
    }, [status, syncWatchlist, syncHistory]);

    return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
    return (
        <SessionProvider>
            <AuthSync>{children}</AuthSync>
        </SessionProvider>
    );
}
