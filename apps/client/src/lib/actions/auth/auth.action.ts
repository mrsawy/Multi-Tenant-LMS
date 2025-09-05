'use server';

import { AUTH_COOKIE_NAME } from '@/middleware';

import { connectToNats, request } from '@/lib/nats/client';
import { v7 as uuidv7 } from 'uuid';
import { redis } from '@/lib/redis/client';
import { redirect } from 'next/navigation';
import { LoginSchema, SignupSchema } from '@/lib/schema/authSchema';
import { getPreferredCurrency } from '@/lib/utils/getPreferredCurrency';
import { UserMainRoles } from '@/lib/data/userRole.enum';
import { setCookie } from '@/lib/utils/serverUtils';
import { RegisterResponse } from '@/lib/types/auth/auth.type';

export async function handleSignup(signUpData: SignupSchema) {
    const natsClient = await connectToNats();
    const { username, role, email, phoneNumber, password, firstName, lastName, country, organizationName, organizationSlug } = signUpData
    const preferredCurrency = getPreferredCurrency(country);
    const userDto = {
        username, role, email, phone: phoneNumber, password, firstName, lastName, preferredCurrency,
        profile: { address: { country } }
    };

    let organizationDto;
    if (role !== UserMainRoles.STUDENT) {
        organizationDto = { name: organizationName, slug: organizationSlug };
    }
    const data = organizationDto ? { userDto, organizationDto } : { userDto }

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
    await redis.set(`auth-${response.access_token}`, JSON.stringify(response.user));
    await setCookie(AUTH_COOKIE_NAME, response.access_token, {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // One week
        path: '/',
    });

    redirect(response.user.role == "STUDENT" ? '/student-dashboard' : "organization-dashboard");
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
    await redis.set(`auth-${response.access_token}`, JSON.stringify(response.user));
    await setCookie(AUTH_COOKIE_NAME, response.access_token, {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // One week
        path: '/',
    });

    redirect(response.user.role == "STUDENT" ? '/student-dashboard' : "organization-dashboard");
}





// export async function logout(redirectAfterLogin = true) {
//   const idToken = await getCookie(AUTH_COOKIE_NAME);
//   if (idToken) {
//     await redis.del(`auth-${idToken}`);
//   }
//   await removeCookie(AUTH_COOKIE_NAME);
//   if (redirectAfterLogin) {
//     throw new Error(redirect('/login'));
//   }
// }
