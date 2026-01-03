import { handleRpcError } from 'src/utils/errorHandling';

/**
 * Method decorator that wraps RPC controller methods with error handling.
 * Preserves all NestJS metadata (MessagePattern, UseGuards, etc.)
 * 
 * Usage:
 * ```typescript
 * @UseGuards(AuthGuard)
 * @MessagePattern('reviews.create')
 * @RpcErrorHandler
 * async create(@Payload() dto, @Ctx() context) {
 *     return await this.service.create(dto);
 * }
 * ```
 */
export function RpcErrorHandler(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
): PropertyDescriptor {
    const originalMethod = descriptor.value;

    // Create a new function that wraps the original
    descriptor.value = async function (...args: any[]) {
        try {
            return await originalMethod.apply(this, args);
        } catch (error) {
            handleRpcError(error);
        }
    };

    // CRITICAL: Copy all metadata from original method to wrapped method
    // This preserves @MessagePattern, @UseGuards, etc.
    const metadataKeys = Reflect.getMetadataKeys(originalMethod);
    for (const key of metadataKeys) {
        const metadata = Reflect.getMetadata(key, originalMethod);
        Reflect.defineMetadata(key, metadata, descriptor.value);
    }

    return descriptor;
}