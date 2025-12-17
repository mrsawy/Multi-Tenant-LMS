
import { redis } from '@/lib/redis/client';
import { connectToNats, request as natsRequest } from '@/lib/nats/client';
import { NextRequest, NextResponse } from 'next/server';
import { RegisterResponse } from '@/lib/types/auth/auth.type';
import { IUser } from '@/lib/types/user/user.interface';
import { v7 } from 'uuid';
import { getCourseWithModules } from '@/lib/actions/courses/modules.action';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';

export async function GET(request: NextRequest) {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!authCookie) return new NextResponse(undefined, { status: 401 })

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")
    if (!courseId) {
        return NextResponse.json({ message: "courseId Is required" }, { status: 404 })
    }

    const courseWithModules = await getCourseWithModules(courseId)
    return NextResponse.json(courseWithModules)
}