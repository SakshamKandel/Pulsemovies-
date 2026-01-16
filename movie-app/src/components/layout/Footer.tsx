import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative mt-12">
            {/* Gradient fade */}
            <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-background pointer-events-none" />

            <div className="container mx-auto px-4 md:px-8 py-6">
                {/* Centered Logo */}
                <div className="flex flex-col items-center text-center">
                    <Link href="/" className="mb-3">
                        <Image
                            src="/images/logo.png"
                            alt="Pulse Movies"
                            width={400}
                            height={130}
                            className="h-32 w-auto"
                        />
                    </Link>

                    {/* Quick Links */}
                    <div className="flex gap-6 text-sm text-text-muted mb-4">
                        <Link href="/browse/movies" className="hover:text-white transition-colors">Movies</Link>
                        <Link href="/browse/series" className="hover:text-white transition-colors">TV Shows</Link>
                        <Link href="/my-list" className="hover:text-white transition-colors">My List</Link>
                    </div>

                    {/* Copyright */}
                    <span className="text-text-muted text-xs">
                        © {currentYear} Pulse Movies
                    </span>
                </div>
            </div>
        </footer>
    );
}
