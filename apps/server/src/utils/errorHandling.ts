import { BadRequestException, InternalServerErrorException, NotFoundException } from "@nestjs/common";

export const handleError = (error: Error) => {
    if (error instanceof NotFoundException) {
        throw error; // rethrow custom not found
    }

    if (error instanceof NotFoundException) {
        throw new BadRequestException(error.message); 
    }

    throw new InternalServerErrorException(
        'Process Failed. Please try again later.',
    );
}