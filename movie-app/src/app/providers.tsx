'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { KeyboardShortcutsProvider } from '@/hooks/useKeyboardShortcuts';
import { GenreOnboarding } from '@/components/onboarding/GenreOnboarding';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <KeyboardShortcutsProvider>
                {children}
            </KeyboardShortcutsProvider>
            <GenreOnboarding />
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#16162A',
                        color: '#FFFFFF',
                        border: '1px solid #2D2D44',
                    },
                    success: {
                        iconTheme: {
                            primary: '#E91E8C',
                            secondary: '#FFFFFF',
                        },
                    },
                }}
            />
        </QueryClientProvider>
    );
}
