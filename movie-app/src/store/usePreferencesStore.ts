import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
    favoriteGenres: number[]; // Genre IDs
    hasCompletedOnboarding: boolean;
    prefersDarkMode: boolean;
    videoQuality: 'auto' | 'hd720' | 'hd1080' | 'highres';
}

interface PreferencesState extends UserPreferences {
    setFavoriteGenres: (genres: number[]) => void;
    toggleGenre: (genreId: number) => void;
    completeOnboarding: () => void;
    setVideoQuality: (quality: UserPreferences['videoQuality']) => void;
    resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
    favoriteGenres: [],
    hasCompletedOnboarding: false,
    prefersDarkMode: true,
    videoQuality: 'auto',
};

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set, get) => ({
            ...defaultPreferences,

            setFavoriteGenres: (genres) => set({ favoriteGenres: genres }),

            toggleGenre: (genreId) => {
                const current = get().favoriteGenres;
                if (current.includes(genreId)) {
                    set({ favoriteGenres: current.filter(id => id !== genreId) });
                } else {
                    set({ favoriteGenres: [...current, genreId] });
                }
            },

            completeOnboarding: () => set({ hasCompletedOnboarding: true }),

            setVideoQuality: (quality) => set({ videoQuality: quality }),

            resetPreferences: () => set(defaultPreferences),
        }),
        {
            name: 'pulse-user-preferences',
        }
    )
);
