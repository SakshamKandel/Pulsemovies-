import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Movie, TVShow, MovieDetails, TVShowDetails } from '@/types/movie';
import { getSession } from 'next-auth/react';

type ContentItem = Movie | TVShow | MovieDetails | TVShowDetails;
type WatchlistItem = ContentItem & { addedAt: number };

interface WatchlistState {
    items: WatchlistItem[];
    addToWatchlist: (item: ContentItem, profileId?: string) => Promise<void>;
    removeFromWatchlist: (id: number, profileId?: string) => Promise<void>;
    isInWatchlist: (id: number) => boolean;
    clearWatchlist: () => void;
    syncWithDatabase: (profileId: string) => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>()(
    persist(
        (set, get) => ({
            items: [],

            addToWatchlist: async (item, profileId) => {
                const exists = get().items.some((i) => i.id === item.id);
                if (!exists) {
                    // Optimistic update
                    set((state) => ({
                        items: [...state.items, { ...item, addedAt: Date.now() }],
                    }));

                    // Sync with DB if logged in and profileId provided
                    if (profileId) {
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
                                    profileId,
                                }),
                            });
                        } catch (error) {
                            console.error('Failed to sync watchlist item', error);
                        }
                    }
                }
            },

            removeFromWatchlist: async (id, profileId) => {
                // Optimistic update
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));

                // Sync with DB
                if (profileId) {
                    try {
                        await fetch(`/api/watchlist?tmdbId=${id}&profileId=${profileId}`, {
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

            syncWithDatabase: async (profileId: string) => {
                if (!profileId) return;

                try {
                    const res = await fetch(`/api/watchlist?profileId=${profileId}`);
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
