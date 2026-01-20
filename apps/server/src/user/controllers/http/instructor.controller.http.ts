import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
    Request,
    BadRequestException,
} from '@nestjs/common';
import { InstructorService } from '../../services/instructor.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { IUserRequest } from 'src/auth/interfaces/IUserRequest.interface';
import { PaginateOptionsWithSearch } from 'src/utils/types/PaginateOptionsWithSearch';
import mongoose from 'mongoose';
import { User } from '../../entities/user.entity';
import { handleError } from 'src/utils/errorHandling';

@Controller('instructor')
export class InstructorControllerHttp {
    constructor(
        private readonly instructorService: InstructorService,
    ) { }

    @Get()
    @UseGuards(AuthGuard)
    async findAll(
        @Query() options: PaginateOptionsWithSearch,
        @Request() req: IUserRequest,
    ) {
        try {
            const organizationId = req.user.organizationId;
            if (!organizationId) {
                throw new BadRequestException('Organization ID is required');
            }

            // Build filters from query params
            const filters: mongoose.RootFilterQuery<User> = {
                organizationId: new mongoose.Types.ObjectId(organizationId),
            };

            if (options.search) {
                filters.$or = [
                    { firstName: { $regex: options.search, $options: 'i' } },
                    { lastName: { $regex: options.search, $options: 'i' } },
                    { email: { $regex: options.search, $options: 'i' } },
                    { username: { $regex: options.search, $options: 'i' } },
                ];
            }

            return await this.instructorService.findAll(options, filters);
        } catch (error) {
            handleError(error);
        }
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    async findOne(
        @Param('id') id: string,
        @Request() req: IUserRequest,
    ) {
        try {
            const organizationId = req.user.organizationId;
            if (!organizationId) {
                throw new BadRequestException('Organization ID is required');
            }

            const filters: mongoose.RootFilterQuery<User> = {
                _id: new mongoose.Types.ObjectId(id),
                organizationId: new mongoose.Types.ObjectId(organizationId),
            };

            return await this.instructorService.filterOne(filters);
        } catch (error) {
            handleError(error);
        }
    }
}
