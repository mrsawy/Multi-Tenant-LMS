import { handleRpcError } from 'src/utils/errorHandling';

/**
 * Class decorator that wraps all methods with RPC error handling.
 * Preserves NestJS metadata for decorators like @MessagePattern, @UseGuards, etc.
 * 
 * Usage:
 * ```typescript
 * @ApplyRpcErrorHandling
 * @Controller()
 * export class ReviewControllerMessage {
 *     @MessagePattern('reviews.create')
 *     async create() { ... }
 * }
 * ```
 */
export function ApplyRpcErrorHandling<T extends { new(...args: any[]): {} }>(constructor: T) {
    const methodNames = Object.getOwnPropertyNames(constructor.prototype);

    for (const methodName of methodNames) {
        if (methodName === 'constructor') continue;

        const descriptor = Object.getOwnPropertyDescriptor(constructor.prototype, methodName);
        if (!descriptor || typeof descriptor.value !== 'function') continue;

        const originalMethod = descriptor.value;

        // Create wrapper that preserves the original function's properties
        const wrappedMethod = async function (...args: any[]) {
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
            Reflect.defineMetadata(key, metadata, wrappedMethod);
        }

        // Preserve the original method name for debugging
        Object.defineProperty(wrappedMethod, 'name', { value: originalMethod.name });

        // Update the descriptor with the wrapped method while preserving configurability
        descriptor.value = wrappedMethod;
        Object.defineProperty(constructor.prototype, methodName, descriptor);
    }

    return constructor;
}