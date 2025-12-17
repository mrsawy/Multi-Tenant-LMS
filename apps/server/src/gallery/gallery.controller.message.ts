
import { Controller, UseGuards } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { MessagePattern, Payload, Ctx, RpcException } from '@nestjs/microservices';
import { AuthGuard } from '../auth/auth.guard';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { GalleryPresignedUrlDto } from './dto/gallery-presigned.dto';
import { IUserContext } from '../utils/types/IUserContext.interface';
import { RpcValidationPipe } from '../utils/RpcValidationPipe';
import { PaginateOptions } from 'mongoose';

@Controller()
export class GalleryControllerMessage {
  constructor(private readonly galleryService: GalleryService) { }

  @UseGuards(AuthGuard)
  @MessagePattern('gallery.generatePresignedUrl')
  async generatePresignedUrl(
    @Ctx() context: IUserContext,
    @Payload(new RpcValidationPipe()) dto: GalleryPresignedUrlDto,
  ) {
    try {
      const userId = context.userPayload._id.toString();
      const username = context.userPayload.username;
      return await this.galleryService.generatePresignedUrl(userId, username, dto);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @UseGuards(AuthGuard)
  @MessagePattern('gallery.create')
  async create(
    @Ctx() context: IUserContext,
    @Payload(new RpcValidationPipe()) createGalleryDto: CreateGalleryDto,
  ) {
    try {
      const userId = context.userPayload._id.toString();
      return await this.galleryService.create(userId, createGalleryDto);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @UseGuards(AuthGuard)
  @MessagePattern('gallery.findAll')
  async findAll(
    @Ctx() context: IUserContext,
    @Payload(new RpcValidationPipe()) paginateOptions: PaginateOptions,
  ) {
    try {
      const userId = context.userPayload._id.toString();
      return await this.galleryService.findAll(userId, paginateOptions);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  @UseGuards(AuthGuard)
  @MessagePattern('gallery.delete')
  async delete(
    @Ctx() context: IUserContext,
    @Payload(new RpcValidationPipe()) dto: { galleryId: string },
  ) {
    try {
      const userId = context.userPayload._id.toString();
      return await this.galleryService.delete(userId, dto.galleryId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
