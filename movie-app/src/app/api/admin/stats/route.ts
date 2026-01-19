import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkSuperAdmin, notFoundResponse, jsonResponse } from '@/lib/adminAuth';

export async function GET() {
    try {
        const { isAdmin } = await checkSuperAdmin();

        if (!isAdmin) {
            return notFoundResponse();
        }

        // Get various statistics
        const [
            totalUsers,
            totalProfiles,
            totalWatchlistItems,
            totalWatchHistory,
            newUsersLast7Days,
            recentActivity
        ] = await Promise.all([
            prisma.user.count(),
            prisma.profile.count(),
            prisma.watchlist.count(),
            prisma.watchHistory.count(),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            }),
            prisma.watchHistory.findMany({
                take: 10,
                orderBy: { updatedAt: 'desc' },
                include: {
                    profile: {
                        include: {
                            user: {
                                select: { email: true, name: true }
                            }
                        }
                    }
                }
            })
        ]);

        // Get user counts by role
        const usersByRole = await prisma.user.groupBy({
            by: ['role'],
            _count: true
        });

        const avgProfilesPerUser = totalUsers > 0
            ? Math.round((totalProfiles / totalUsers) * 10) / 10
            : 0;

        return jsonResponse({
            stats: {
                totalUsers,
                totalProfiles,
                totalWatchlistItems,
                totalWatchHistory,
                newUsersLast7Days,
                avgProfilesPerUser
            },
            usersByRole: usersByRole.reduce((acc, item) => {
                acc[item.role] = item._count;
                return acc;
            }, {} as Record<string, number>),
            recentActivity: recentActivity.map(h => ({
                id: h.id,
                title: h.title,
                mediaType: h.mediaType,
                progress: h.progress,
                updatedAt: h.updatedAt,
                profileName: h.profile.name,
                userEmail: h.profile.user.email,
                userName: h.profile.user.name
            }))
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return notFoundResponse(); // Hide errors from non-admins
    }
}
