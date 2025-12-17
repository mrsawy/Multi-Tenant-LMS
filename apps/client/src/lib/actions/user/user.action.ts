'use server';



import { deleteFromS3, getCookie } from '@/lib/utils/serverUtils';
import { redis } from '@/lib/redis/client';
import { IUser } from '@/lib/types/user/user.interface';
import { connectToNats, request as natsRequest } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';
import { CreateUserFormData } from '@/lib/schema/user.schema';
import { uploadFile } from '@/lib/utils/uploadFile';
import { slugify } from '@/lib/utils/slugify';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import { getPreferredCurrency } from '@/lib/utils/getPreferredCurrency';



export async function getAuthUser() {
    const idToken = await getCookie(AUTH_COOKIE_NAME);
    if (!idToken) return;

    const cachedUserString = await redis.get(`auth-${idToken}`);
    if (cachedUserString) {
        const user = JSON.parse(cachedUserString) as IUser;
        return user;
    }

    const natsClient = await connectToNats();
    const response = await natsRequest<{ message: string, user: IUser } | { err: { message: string } }>(
        natsClient,
        'user.getOwnData',
        JSON.stringify({
            id: v7(),
            data: { authorization: idToken },
        }),
    );

    if ('err' in (response as any)) return;
    return (response as { message: string, user: IUser }).user;
}




export async function createUserAction(userData: CreateUserFormData): Promise<IUser> {
    let avatarUrl;
    try {
        if (userData.profile?.avatarFile instanceof File) {
            const fileExtension = userData.profile?.avatarFile.name.split('.').pop() || 'jpg';
            avatarUrl = await uploadFile(
                await userData.profile?.avatarFile.arrayBuffer(),
                `users/avatars/${slugify(userData.firstName + userData.lastName + userData.username)}_${v7()}_thumbnail.${fileExtension}`,
                userData.profile?.avatarFile.type,
            );
            userData.profile.avatar = avatarUrl;
        }
        delete userData.profile?.avatarFile;
        userData.profile = { ...userData.profile, address: { ...userData.profile?.address, country: userData.country } }
        userData.preferredCurrency = getPreferredCurrency(userData.country)
        return await createAuthorizedNatsRequest("users.organizationCreateUser", userData)
    }
    catch (error) {
        if (avatarUrl) await deleteFromS3(avatarUrl)
        throw error
    }

}