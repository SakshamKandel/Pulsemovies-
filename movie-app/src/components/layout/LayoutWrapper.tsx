'use client';

import { PopupBlocker } from './PopupBlocker';
import { usePathname } from 'next/navigation';
import { TrailerProvider } from '@/components/movie/TrailerProvider';
import { TrailerRail } from '@/components/movie/TrailerRail';
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
        <><PopupBlocker /><ProfileGate>
            <TrailerProvider><div className="site-shell min-h-screen flex flex-col">
                <a href="#page-content" className="skip-link">Skip to content</a>
                <Navbar />
                <main id="page-content" className="flex-1">{children}</main>
                {!pathname?.startsWith('/pulses') && !pathname?.endsWith('/watch') && !['/login', '/signup', '/who-is-watching', '/about', '/terms'].includes(pathname || '') && <TrailerRail key={pathname} />}
                <Footer />
            </div></TrailerProvider>
        </ProfileGate></>
    );
}
