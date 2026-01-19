import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        console.log('Test DB: Checking connection...');
        console.log('Test DB: DATABASE_URL present:', !!process.env.DATABASE_URL);

        // Try to query the user table (count)
        const userCount = await prisma.user.count();

        return NextResponse.json({
            status: 'success',
            message: 'Connected to database',
            userCount,
            envCheck: !!process.env.DATABASE_URL
        });
    } catch (error: any) {
        console.error('Test DB: Connection failed:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
