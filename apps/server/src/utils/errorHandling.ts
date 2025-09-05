import { BadRequestException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { RpcException } from '@nestjs/microservices';

export const handleError = (error: Error) => {
    console.dir(error, { depth: null })

    if (error instanceof NotFoundException) {
        throw error; // rethrow custom not found
    }

    if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
    }

    throw new InternalServerErrorException(
        'Process Failed. Please try again later.',
    );
}

export const handleRpcError = (error: unknown) => {
    if (error instanceof NotFoundException) {
        throw new RpcException({
            message: error.message,
            code: 404,
            error: 'Not Found',
        });
    }

    if (error instanceof BadRequestException) {
        throw new RpcException({
            message: error.message,
            code: 400,
            error: 'Bad Request',
        });
    }

    const message = (error as Error)?.message || 'Process Failed. Please try again later.';
    throw new RpcException({
        message,
        code: 500,
        error: 'Internal Server Error',
    });
}