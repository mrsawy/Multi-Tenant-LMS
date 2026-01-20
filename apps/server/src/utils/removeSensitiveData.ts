/**
 * Utility functions to remove sensitive data from user objects
 */

/**
 * Removes password field from a user object
 * @param user - User object (can be Mongoose document or plain object)
 * @returns User object without password field
 */
export function removePassword<T extends { password?: any }>(user: T): Omit<T, 'password'> {
    if (!user) return user as any;

    if (typeof (user as any).toObject === 'function') {
        // Mongoose document
        const { password, ...userData } = (user as any).toObject();
        return userData as Omit<T, 'password'>;
    }

    // Plain object
    const { password, ...userData } = user;
    return userData as Omit<T, 'password'>;
}

/**
 * Removes multiple sensitive fields from a user object
 * @param user - User object (can be Mongoose document or plain object)
 * @param fieldsToRemove - Array of field names to remove (default: ['password'])
 * @returns User object without specified sensitive fields
 */
export function remove<T extends Record<string, any>>(
    user: T,
    fieldsToRemove: string[] = ['password']
): Omit<T, keyof T> {
    if (!user) return user as any;

    let userData: any;

    if (typeof (user as any).toObject === 'function') {
        // Mongoose document
        userData = (user as any).toObject();
    } else {
        // Plain object - create a copy
        userData = { ...user };
    }

    // Remove specified fields
    fieldsToRemove.forEach(field => {
        delete userData[field];
    });

    return userData as Omit<T, keyof T>;
}
