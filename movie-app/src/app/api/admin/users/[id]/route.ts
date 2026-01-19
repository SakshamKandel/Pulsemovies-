import prisma from '@/lib/prisma';
import { checkSuperAdmin, notFoundResponse, jsonResponse } from '@/lib/adminAuth';

// GET - Get user details
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { isAdmin } = await checkSuperAdmin();
        if (!isAdmin) return notFoundResponse();

        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                profiles: {
                    include: {
                        _count: { select: { watchHistory: true, watchlist: true } }
                    }
                }
            }
        });

        if (!user) {
            return jsonResponse({ error: 'User not found' }, 404);
        }

        // Get recent activity for this user's profiles
        const profileIds = user.profiles.map(p => p.id);

        const [recentWatchlist, recentHistory] = await Promise.all([
            prisma.watchlist.findMany({
                where: { profileId: { in: profileIds } },
                take: 5,
                orderBy: { addedAt: 'desc' },
                include: { profile: { select: { name: true } } }
            }),
            prisma.watchHistory.findMany({
                where: { profileId: { in: profileIds } },
                take: 5,
                orderBy: { updatedAt: 'desc' },
                include: { profile: { select: { name: true } } }
            })
        ]);

        return jsonResponse({
            ...user,
            profiles: user.profiles.map(p => ({
                ...p,
                watchHistoryCount: p._count.watchHistory,
                watchlistCount: p._count.watchlist,
                _count: undefined
            })),
            recentWatchlist: recentWatchlist.map(w => ({
                ...w,
                profileName: w.profile.name,
                profile: undefined
            })),
            recentHistory: recentHistory.map(h => ({
                ...h,
                profileName: h.profile.name,
                profile: undefined
            }))
        });
    } catch (error) {
        console.error('Admin user details error:', error);
        return notFoundResponse();
    }
}
