import { HeroSkeleton, MovieRowSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
    return (
        <div className="min-h-screen">
            <HeroSkeleton />
            <div className="container mx-auto px-4 md:px-8 -mt-32 relative z-10 space-y-12 pb-16">
                <MovieRowSkeleton />
                <MovieRowSkeleton />
                <MovieRowSkeleton />
                <MovieRowSkeleton />
            </div>
        </div>
    );
}
