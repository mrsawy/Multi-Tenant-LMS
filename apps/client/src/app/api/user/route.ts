import { redis } from '@/lib/redis/client';
import { connectToNats, request as natsRequest } from '@/lib/nats/client';
import { NextRequest, NextResponse } from 'next/server';
import { RegisterResponse } from '@/lib/types/auth/auth.type';
import { IUser } from '@/lib/types/user/user.interface';
import { v7 } from 'uuid';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';
export async function GET(request: NextRequest) {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!authCookie) return new NextResponse(undefined, { status: 401 })
    let userString = await redis.get(`auth-${authCookie}`,);
    let user: IUser | undefined;
    if (userString) user = JSON.parse(userString) as IUser

    if (!userString) {
        const natsClient = await connectToNats();
        const response = await natsRequest<{ message: string, user: IUser }>(
            natsClient,
            'user.getOwnData',
            JSON.stringify({
                id: v7(),
                data: { authorization: authCookie },
            }),
        );

        if ('err' in response) {
            return new NextResponse(undefined, {
                status: 401,
            });
        }
        user = response.user
    }

    if (!user) return new NextResponse(undefined, { status: 401 })

    const response = new NextResponse(JSON.stringify(user));
    response.headers.set('Content-Type', 'application/json');

    return response;
}
