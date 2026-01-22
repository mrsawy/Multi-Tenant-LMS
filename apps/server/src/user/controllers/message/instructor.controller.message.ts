import {
    Controller,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { InstructorService } from '../../services/instructor.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
    Ctx,
    MessagePattern,
    Payload,
} from '@nestjs/microservices';
import { IUserContext } from 'src/utils/types/IUserContext.interface';
import { RpcValidationPipe } from 'src/utils/RpcValidationPipe';
import mongoose, { PaginateOptions } from 'mongoose';
import { User } from '../../entities/user.entity';
import { convertObjectValuesToObjectId } from 'src/utils/ObjectId.utils';
import { ApplyRpcErrorHandling } from 'src/utils/docerators/error-handeling/class/ApplyRpcErrorHandling.decorator';

@ApplyRpcErrorHandling
@Controller('instructor')
export class InstructorControllerMessage {
    constructor(
        private readonly instructorService: InstructorService,
    ) { }

    @MessagePattern('instructors.findAll')
    async findAll(
        @Payload(new RpcValidationPipe())
        payload: {
            options: PaginateOptions;
            filters?: mongoose.RootFilterQuery<User>;
        },
    ) {
        // Convert ObjectIds and numeric values in MongoDB operators
        const filters: mongoose.RootFilterQuery<User> = {
            ...(payload.filters ? convertObjectValuesToObjectId(payload.filters) : {}),
        };

        return await this.instructorService.findAll(payload.options, filters);
    }

    @MessagePattern('instructors.findOne')
    async findOne(
        @Payload(new RpcValidationPipe())
        payload: {
            instructorId: string;
        },
    ) {
        return await this.instructorService.filterOne({
            _id: new mongoose.Types.ObjectId(payload.instructorId),
        });

    }

    @MessagePattern('instructors.filterOne')
    @UseGuards(AuthGuard)
    async filterOne(
        @Ctx() context: IUserContext,
        @Payload(new RpcValidationPipe())
        payload: {
            filters: mongoose.RootFilterQuery<User>;
        },
    ) {
        const organizationId = context.userPayload.organizationId;
        if (!organizationId) {
            throw new BadRequestException('Organization ID is required');
        }

        const filters: mongoose.RootFilterQuery<User> = {
            organizationId: new mongoose.Types.ObjectId(organizationId),
            ...convertObjectValuesToObjectId(payload.filters),
        };

        return await this.instructorService.filterOne(filters);

    }
}
