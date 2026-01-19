import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        console.log('Avatar API: Session user:', session?.user?.email);

        // If not authenticated, return 401 or a default image placeholder logic if desired
        if (!session?.user?.email) {
            console.log('Avatar API: Unauthorized');
            return new NextResponse(null, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { avatar: true }
        });

        console.log('Avatar API: User found:', !!user, 'Avatar length:', user?.avatar?.length);

        if (!user || (!user.avatar && !session.user.image)) {
            // If no DB avatar, return 404
            return new NextResponse(null, { status: 404 });
        }

        const avatarData = user.avatar;

        if (!avatarData) {
            return new NextResponse(null, { status: 404 });
        }

        // The avatar is stored as a Data URI (e.g., "data:image/jpeg;base64,/9j/4AAQ...")
        const matches = avatarData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
            console.log('Avatar API: Invalid Data URI format');
            // Fallback if not a valid data URI
            return new NextResponse(null, { status: 400 });
        }

        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');

        console.log('Avatar API: Serving image', contentType);

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=60, stale-while-revalidate=30',
            },
        });

    } catch (error) {
        console.error('Avatar fetch error:', error);
        return new NextResponse(null, { status: 500 });
    }
}
