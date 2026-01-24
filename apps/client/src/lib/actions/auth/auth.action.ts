'use server';



import { connectToNats, request } from '@/lib/nats/client';
import { v7 as uuidv7 } from 'uuid';
import { redis } from '@/lib/redis/client';
import { redirect } from 'next/navigation';
import { LoginSchema, SignupSchema } from '@/lib/schema/authSchema';
import { getPreferredCurrency } from '@/lib/utils/getPreferredCurrency';
import { UserMainRoles } from '@/lib/data/userRole.enum';
import { getCookie, removeCookie, setCookie } from '@/lib/utils/serverUtils';
import { RegisterResponse } from '@/lib/types/auth/auth.type';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';
import { parseDurationToSeconds } from '@/lib/utils';

export async function handleSignup(signUpData: SignupSchema, wishlistCourseIds?: string[]) {
    const natsClient = await connectToNats();
    const { username, roleName, email, phoneNumber, password, firstName, lastName, country, organizationName, organizationSlug } = signUpData
    const preferredCurrency = getPreferredCurrency(country);
    const userDto = {
        username, roleName, email, phone: phoneNumber, password, firstName, lastName, preferredCurrency,
        profile: { address: { country } }
    };

    let organizationDto;
    if (roleName !== UserMainRoles.STUDENT) {
        organizationDto = { name: organizationName, slug: organizationSlug };
    }
    const data = organizationDto 
        ? { userDto, organizationDto, ...(wishlistCourseIds && wishlistCourseIds.length > 0 ? { wishlistCourseIds } : {}) }
        : { userDto, ...(wishlistCourseIds && wishlistCourseIds.length > 0 ? { wishlistCourseIds } : {}) }

    const response = await request<RegisterResponse>(
        natsClient,
        'auth.register',
        JSON.stringify({
            id: uuidv7(),
            data,
        }),
    );

    console.log({ response })
    if ('err' in response) {
        console.dir({ response }, { depth: null })
        if (response.err.code == "409") return response
        throw new Error(response.err.message)
    }
    const authExpiresIn = process.env.AUTH_EXPIRES_IN || '7d';
    const ttlInSeconds = parseDurationToSeconds(authExpiresIn);
    await redis.set(`auth-${response.access_token}`, JSON.stringify(response.user), 'EX', ttlInSeconds);
    await setCookie(AUTH_COOKIE_NAME, response.access_token, {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        maxAge: ttlInSeconds,
        path: '/',
    });
    return response.user
}


export async function handleLogin(loginData: LoginSchema) {
    const natsClient = await connectToNats();
    const response = await request<RegisterResponse>(
        natsClient,
        'auth.login',
        JSON.stringify({
            id: uuidv7(),
            data: loginData,
        }),
    );

    console.log({ response })
    if ('err' in response) {
        console.dir({ response }, { depth: null })
        if (response.err.code == "409") return response
        throw new Error(response.err.message)
    }
    const authExpiresIn = process.env.AUTH_EXPIRES_IN
    const ttlInSeconds = parseDurationToSeconds(authExpiresIn);
    await redis.set(`auth-${response.access_token}`, JSON.stringify(response.user), 'EX', ttlInSeconds);
    await setCookie(AUTH_COOKIE_NAME, response.access_token, {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        maxAge: ttlInSeconds,
        path: '/',
    });

    console.dir({ response }, { depth: null })

    return response.user

}





export async function logout(redirectAfterLogin = true) {
    const idToken = await getCookie(AUTH_COOKIE_NAME);
    if (idToken) {
        await redis.del(`auth-${idToken}`);
    }
    await removeCookie(AUTH_COOKIE_NAME);
    if (redirectAfterLogin) {
        throw new Error(redirect('/'));
    }
}