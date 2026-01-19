'use client';

import { useEffect, useRef } from 'react';
import { useProfile } from '@/context/ProfileContext';
import ProfileSelection from '@/components/profiles/ProfileSelection';

/**
 * This page allows users to switch profiles.
 * It clears the current profile on mount and shows the ProfileSelection.
 */
export default function WhoIsWatchingPage() {
    const { clearProfile, isLoading } = useProfile();
    const hasCleared = useRef(false);

    // Clear current profile when visiting this page (allows profile switching)
    useEffect(() => {
        if (!isLoading && !hasCleared.current) {
            hasCleared.current = true;
            clearProfile();
        }
    }, [isLoading, clearProfile]);

    // Always show ProfileSelection - no redirect needed
    // ProfileGate in layout will handle showing main content after profile is selected
    return <ProfileSelection />;
}
