import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const profileId = searchParams.get('profileId');

        if (!profileId) {
            return NextResponse.json({ error: 'Missing profileId' }, { status: 400 });
        }

        // Verify profile belongs to user
        const profile = await prisma.profile.findFirst({
            where: { id: profileId, userId: session.user.id }
        });

        if (!profile) {
            // Check if it's a legacy request or just unauthorized. 
            // For safety, return empty or error.
            return NextResponse.json({ error: 'Unauthorized profile access' }, { status: 403 });
        }

        const watchlist = await prisma.watchlist.findMany({
            where: { profileId: profileId },
            orderBy: { addedAt: 'desc' },
        });

        return NextResponse.json(watchlist);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { tmdbId, mediaType, title, posterPath, voteAverage, profileId } = body;

        if (!profileId) {
            return NextResponse.json({ error: 'Missing profileId' }, { status: 400 });
        }

        // Verify profile belongs to user
        const profile = await prisma.profile.findFirst({
            where: { id: profileId, userId: session.user.id }
        });

        if (!profile) {
            return NextResponse.json({ error: 'Unauthorized profile access' }, { status: 403 });
        }

        const item = await prisma.watchlist.create({
            data: {
                profileId,
                tmdbId,
                mediaType,
                title,
                posterPath,
                voteAverage,
            },
        });

        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const tmdbId = searchParams.get('tmdbId');

        if (!tmdbId) {
            return NextResponse.json({ error: 'Missing tmdbId' }, { status: 400 });
        }

        const profileId = searchParams.get('profileId');
        if (!profileId) {
            return NextResponse.json({ error: 'Missing profileId' }, { status: 400 });
        }

        // Verify profile belongs to user
        const profile = await prisma.profile.findFirst({
            where: { id: profileId, userId: session.user.id }
        });

        if (!profile) {
            return NextResponse.json({ error: 'Unauthorized profile access' }, { status: 403 });
        }

        await prisma.watchlist.deleteMany({
            where: {
                profileId: profileId,
                tmdbId: parseInt(tmdbId),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 });
    }
}
