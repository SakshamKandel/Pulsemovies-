'use client';

import { useProfile } from '@/context/ProfileContext';
import ProfileSelection from './ProfileSelection';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function ProfileGate({ children }: { children: React.ReactNode }) {
    const { currentProfile, isLoading } = useProfile();
    const { status } = useSession();

    if (status === 'loading' || isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        // If not logged in, just show children (likely the landing page or login page)
        // Or handle redirect in middleware
        return <>{children}</>;
    }

    if (!currentProfile) {
        return <ProfileSelection />;
    }

    return <>{children}</>;
}
