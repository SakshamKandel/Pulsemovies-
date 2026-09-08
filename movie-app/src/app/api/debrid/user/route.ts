import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || process.env.REAL_DEBRID_API_KEY;

    if (!token) {
        return NextResponse.json(
            { error: 'No Real-Debrid API token provided' },
            { status: 400 }
        );
    }

    try {
        const res = await fetch('https://api.real-debrid.com/rest/1.0/user', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                {
                    valid: false,
                    error: errorData.error || `Real-Debrid error: ${res.statusText}`,
                },
                { status: res.status }
            );
        }

        const data = await res.json();
        const isPremium = data.type === 'premium';
        const expirationDate = data.expiration ? new Date(data.expiration) : null;
        const daysRemaining = expirationDate
            ? Math.max(0, Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            : 0;

        return NextResponse.json({
            valid: true,
            username: data.username,
            type: data.type,
            isPremium,
            expiration: data.expiration,
            daysRemaining,
            avatar: data.avatar,
        });
    } catch (error) {
        console.error('Real-Debrid User Check Error:', error);
        return NextResponse.json(
            { error: 'Failed to verify Real-Debrid token' },
            { status: 500 }
        );
    }
}
