'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export interface Profile {
    id: string;
    name: string;
    avatar?: string | null;
    language?: string;
    autoplay?: boolean;
    gameHandle?: string | null;
    userId: string;
}

interface ProfileContextType {
    currentProfile: Profile | null;
    profiles: Profile[];
    isLoading: boolean;
    refreshProfiles: () => Promise<void>;
    selectProfile: (profile: Profile) => void;
    clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchProfiles = async () => {
        try {
            const res = await fetch('/api/profiles');
            if (res.ok) {
                const data = await res.json();
                setProfiles(data);
            }
        } catch (error) {
            console.error('Failed to fetch profiles', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchProfiles();
        } else if (status === 'unauthenticated') {
            setCurrentProfile(null);
            setProfiles([]);
            setIsLoading(false);
        }
    }, [status]);

    // Load persisted profile on mount
    useEffect(() => {
        const savedProfile = localStorage.getItem('pulse_current_profile');
        if (savedProfile) {
            try {
                const parsed = JSON.parse(savedProfile);
                setCurrentProfile(parsed);
            } catch (e) {
                localStorage.removeItem('pulse_current_profile');
            }
        }
    }, []);

    const selectProfile = (profile: Profile) => {
        setCurrentProfile(profile);
        localStorage.setItem('pulse_current_profile', JSON.stringify(profile));
        // Navigate to home after selecting profile
        router.push('/');
    };

    const clearProfile = () => {
        setCurrentProfile(null);
        localStorage.removeItem('pulse_current_profile');
        // Don't navigate - ProfileGate will show ProfileSelection when currentProfile is null
    };

    const refreshProfiles = async () => {
        setIsLoading(true);
        await fetchProfiles();
    };

    return (
        <ProfileContext.Provider
            value={{
                currentProfile,
                profiles,
                isLoading,
                refreshProfiles,
                selectProfile,
                clearProfile
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}
