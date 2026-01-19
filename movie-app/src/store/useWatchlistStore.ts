import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Movie, TVShow, MovieDetails, TVShowDetails } from '@/types/movie';
import { getSession } from 'next-auth/react';

type ContentItem = Movie | TVShow | MovieDetails | TVShowDetails;
type WatchlistItem = ContentItem & { addedAt: number };

interface WatchlistState {
    items: WatchlistItem[];
    addToWatchlist: (item: ContentItem) => Promise<void>;
    removeFromWatchlist: (id: number) => Promise<void>;
    isInWatchlist: (id: number) => boolean;
    clearWatchlist: () => void;
    syncWithDatabase: () => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>()(
    persist(
        (set, get) => ({
            items: [],

            addToWatchlist: async (item) => {
                const exists = get().items.some((i) => i.id === item.id);
                if (!exists) {
                    // Optimistic update
                    set((state) => ({
                        items: [...state.items, { ...item, addedAt: Date.now() }],
                    }));

                    // Sync with DB if logged in
                    const session = await getSession();
                    if (session?.user) {
                        try {
                            const isMovie = 'title' in item;
                            await fetch('/api/watchlist', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    tmdbId: item.id,
                                    mediaType: isMovie ? 'movie' : 'tv',
                                    title: isMovie ? (item as Movie).title : (item as TVShow).name,
                                    posterPath: item.poster_path,
                                    voteAverage: item.vote_average,
                                }),
                            });
                        } catch (error) {
                            console.error('Failed to sync watchlist item', error);
                        }
                    }
                }
            },

            removeFromWatchlist: async (id) => {
                // Optimistic update
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));

                // Sync with DB if logged in
                const session = await getSession();
                if (session?.user) {
                    try {
                        await fetch(`/api/watchlist?tmdbId=${id}`, {
                            method: 'DELETE',
                        });
                    } catch (error) {
                        console.error('Failed to remove watchlist item', error);
                    }
                }
            },

            isInWatchlist: (id) => {
                return get().items.some((item) => item.id === id);
            },

            clearWatchlist: () => {
                set({ items: [] });
            },

            syncWithDatabase: async () => {
                const session = await getSession();
                if (!session?.user) return;

                try {
                    const res = await fetch('/api/watchlist');
                    if (res.ok) {
                        const dbItems = await res.json();
                        // Transform DB items to local format
                        const validItems = dbItems.map((dbItem: any) => ({
                            id: dbItem.tmdbId,
                            title: dbItem.title,
                            name: dbItem.title, // For TV compatibility
                            poster_path: dbItem.posterPath,
                            vote_average: dbItem.voteAverage,
                            addedAt: new Date(dbItem.addedAt).getTime(),
                            media_type: dbItem.mediaType,
                        }));
                        set({ items: validItems });
                    }
                } catch (error) {
                    console.error('Failed to sync watchlist', error);
                }
            },
        }),
        {
            name: 'watchlist-storage',
        }
    )
);
