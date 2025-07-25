import { BadRequestException, InternalServerErrorException, NotFoundException } from "@nestjs/common";

export const handleError = (error: Error) => {
    if (error instanceof NotFoundException) {
        throw error; // rethrow custom not found
    }

    if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message); // Mongoose validation
    }

    throw new InternalServerErrorException(
        'Process Failed. Please try again later.',
    );
}