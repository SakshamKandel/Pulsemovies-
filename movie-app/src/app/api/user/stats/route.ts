import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [watchlistCount, historyCount] = await Promise.all([
            prisma.watchlist.count({ where: { profile: { userId: session.user.id } } }),
            prisma.watchHistory.count({ where: { profile: { userId: session.user.id } } }),
        ]);

        return NextResponse.json({
            watchlist: watchlistCount,
            history: historyCount,
        });
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
    }
}
