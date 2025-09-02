import { redis } from '@/lib/redis/client';
import { AUTH_COOKIE_NAME } from '@/middleware';
import { NextRequest, NextResponse } from 'next/server';
export async function GET(request: NextRequest) {
    const user = await redis.get(
        `auth-${request.cookies.get(AUTH_COOKIE_NAME)?.value}`,
    );
    console.log({ user })
    if (!user) {
        return new NextResponse(undefined, {
            status: 401,
        });
    }
    const response = new NextResponse(user);
    response.headers.set('Content-Type', 'application/json');

    return response;
}
