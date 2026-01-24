'use server';

import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import { IWishlist, CreateWishlistDto, GetWishlistDto } from '@/lib/types/wishlist/wishlist.interface';
import { Paginated } from '@/lib/types/Paginated';

export async function addToWishlist(courseId: string): Promise<IWishlist | null> {
    try {
        const payload: CreateWishlistDto = { courseId };
        return await createAuthorizedNatsRequest<IWishlist>('wishlist.create', payload);
    } catch (error: any) {
        // If not authenticated, return null (will be handled by localStorage)
        if (error.message?.includes('Authentication') || error.message?.includes('token')) {
            return null;
        }
        throw error;
    }
}

export async function removeFromWishlistByCourse(courseId: string): Promise<void | null> {
    try {
        await createAuthorizedNatsRequest('wishlist.removeByCourse', { courseId });
    } catch (error: any) {
        // If not authenticated, return null (will be handled by localStorage)
        if (error.message?.includes('Authentication') || error.message?.includes('token') || error.message?.includes('not found')) {
            return null;
        }
        throw error;
    }
}

export async function getWishlist(options: GetWishlistDto = {}): Promise<Paginated<IWishlist> | null> {
    try {
        return await createAuthorizedNatsRequest<Paginated<IWishlist>>('wishlist.findAll', options);
    } catch (error: any) {
        // If not authenticated, return null (will be handled by localStorage)
        if (error.message?.includes('Authentication') || error.message?.includes('token') || error.message?.includes('not found')) {
            return null;
        }
        throw error;
    }
}
