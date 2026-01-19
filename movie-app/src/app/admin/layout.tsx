'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
    children
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function checkAdminAccess() {
            if (status === 'loading') return;

            if (!session?.user) {
                // Not logged in - show 404
                setIsAdmin(false);
                setChecking(false);
                return;
            }

            // ALWAYS verify via API - don't trust session cache
            try {
                const res = await fetch('/api/admin/verify');
                const data = await res.json();

                if (res.ok && data.isAdmin === true) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch {
                setIsAdmin(false);
            }
            setChecking(false);
        }

        checkAdminAccess();
    }, [session, status, router]);

    if (status === 'loading' || checking || isAdmin === null) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
            </div>
        );
    }

    // Show fake 404 page for non-admins - they shouldn't know admin exists
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <h1 className="text-8xl font-bold text-white/10 mb-4">404</h1>
                    <h2 className="text-xl font-semibold text-white mb-2">Oops...! You are lost</h2>
                    <p className="text-text-muted text-sm mb-6">
                        Sorry, we couldn't find the page you were looking for. To return to Pulse homepage click on the button below.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-2.5 bg-accent-primary hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808] relative overflow-hidden">
            {/* Faded poster background */}
            <div className="fixed inset-0 z-0 opacity-[0.03]">
                <div className="absolute inset-0 grid grid-cols-6 gap-2 p-4 transform -rotate-12 scale-125 origin-center">
                    {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-white/20 rounded" />
                    ))}
                </div>
            </div>

            <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#080808] to-transparent z-10 pointer-events-none" />
            <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent z-10 pointer-events-none" />

            <AdminSidebar />

            <main className="ml-60 min-h-screen relative z-20">
                <div className="p-8 pt-6">{children}</div>
            </main>
        </div>
    );
}
