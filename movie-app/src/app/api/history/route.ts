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
            return NextResponse.json({ error: 'Unauthorized profile access' }, { status: 403 });
        }

        const history = await prisma.watchHistory.findMany({
            where: { profileId: profileId },
            orderBy: { timestamp: 'desc' },
        });

        return NextResponse.json(history);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { tmdbId, mediaType, title, posterPath, progress, profileId } = body;

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

        const historyItem = await prisma.watchHistory.upsert({
            where: {
                profileId_tmdbId: {
                    profileId: profileId,
                    tmdbId: tmdbId,
                },
            },
            update: {
                progress,
                timestamp: new Date(),
                title,       // Update details in case they changed
                posterPath,
                mediaType
            },
            create: {
                profileId,
                tmdbId,
                mediaType,
                title,
                posterPath,
                progress,
            },
        });

        return NextResponse.json(historyItem);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update history' }, { status: 500 });
    }
}
