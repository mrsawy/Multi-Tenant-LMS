import {
    Controller,
    UseGuards,
} from '@nestjs/common';
import {
    Ctx,
    MessagePattern,
    Payload,
    RpcException,
} from '@nestjs/microservices';
import { RpcValidationPipe } from 'src/utils/RpcValidationPipe';
import { AuthGuard } from 'src/auth/auth.guard';
import { IUserContext } from 'src/utils/types/IUserContext.interface';
import { handleRpcError } from 'src/utils/errorHandling';
import { PaginateOptions } from 'src/utils/types/PaginateOptions';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './category.service';

@Controller()
export class CategoryMessageController {
    constructor(private readonly categoryService: CategoryService) { }

    @UseGuards(AuthGuard)
    @MessagePattern('category.create')
    async create(
        @Payload(new RpcValidationPipe())
        createCategoryDto: CreateCategoryDto,
        @Ctx() context: IUserContext,
    ) {
        try {
            // You may want to attach the user/organization info here
            return await this.categoryService.create({
                ...createCategoryDto,
                organizationId: context.userPayload.organizationId.toString(),
            });
        } catch (error) {
            throw new RpcException({
                message: error.message || 'An unexpected error occurred',
                code: 500,
                error: 'Internal Server Error',
            });
        }
    }

    @UseGuards(AuthGuard)
    @MessagePattern('category.update')
    async update(
        @Payload(new RpcValidationPipe())
        payload: { categoryId: string; data: UpdateCategoryDto },
    ) {
        try {
            const { categoryId, data } = payload;
            return await this.categoryService.update(categoryId, data);
        } catch (error) {
            handleRpcError(error);
        }
    }

    @UseGuards(AuthGuard)
    @MessagePattern('category.getAll')
    async getAll(
        @Ctx() context: IUserContext,
        @Payload(new RpcValidationPipe())
        payload: PaginateOptions,
    ) {
        try {
            return await this.categoryService.getAllWithAggregation(
                context.userPayload.organizationId.toString(),
                payload,
            );
        } catch (error) {
            throw new RpcException({
                message: error.message || 'An unexpected error occurred',
                code: 500,
                error: 'Internal Server Error',
            });
        }
    }



    @UseGuards(AuthGuard)
    @MessagePattern('category.getAllFlat')
    async getAllFlat(
        @Ctx() context: IUserContext,
        @Payload(new RpcValidationPipe())
        payload: PaginateOptions,
    ) {
        try {
            return await this.categoryService.getAllFlat(
                context.userPayload.organizationId.toString(),
                payload,
            );
        } catch (error) {
            throw new RpcException({
                message: error.message || 'An unexpected error occurred',
                code: 500,
                error: 'Internal Server Error',
            });
        }
    }



    @UseGuards(AuthGuard)
    @MessagePattern('category.getCategory')
    async setSingle(
        @Ctx() context: IUserContext,
        @Payload(new RpcValidationPipe())
        payload: { categoryId: string },

    ) {
        try {
            return await this.categoryService.getCategoryWithRelations(
                context.userPayload.organizationId.toString(),
                payload.categoryId,
            );
        } catch (error) {
            throw new RpcException({
                message: error.message || 'An unexpected error occurred',
                code: 500,
                error: 'Internal Server Error',
            });
        }
    }


    @UseGuards(AuthGuard)
    @MessagePattern('category.delete')
    async delete(
        @Payload(new RpcValidationPipe())
        payload: { categoryId: string },
    ) {
        try {
            return await this.categoryService.delete(payload.categoryId);
        } catch (error) {
            handleRpcError(error);
        }
    }







}
