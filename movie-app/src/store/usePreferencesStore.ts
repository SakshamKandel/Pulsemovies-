import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
    favoriteGenres: number[]; // Genre IDs
    hasCompletedOnboarding: boolean;
    prefersDarkMode: boolean;
}

interface PreferencesState extends UserPreferences {
    setFavoriteGenres: (genres: number[]) => void;
    toggleGenre: (genreId: number) => void;
    completeOnboarding: () => void;
    resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
    favoriteGenres: [],
    hasCompletedOnboarding: false,
    prefersDarkMode: true,
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

            resetPreferences: () => set(defaultPreferences),
        }),
        {
            name: 'pulse-user-preferences',
        }
    )
);
