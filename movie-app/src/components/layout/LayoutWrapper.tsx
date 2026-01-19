'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ProfileGate from "@/components/profiles/ProfileGate";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');

    // Admin routes get their own layout without navbar/footer
    if (isAdminRoute) {
        return <>{children}</>;
    }

    return (
        <ProfileGate>
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
            </div>
        </ProfileGate>
    );
}
