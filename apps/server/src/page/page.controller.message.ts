import { Controller, NotFoundException, UseGuards } from '@nestjs/common';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';
import { PageService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { IUserContext } from 'src/utils/types/IUserContext.interface';
import mongoose, { PaginateOptions, Types } from 'mongoose';
import { Page } from './entities/page.entity';

@Controller()
export class PageControllerMessage {
  constructor(private readonly pageService: PageService) {}

  @UseGuards(AuthGuard)
  @MessagePattern('pages.createPage')
  async create(
    @Payload() createPageDto: CreatePageDto,
    @Ctx() context: IUserContext,
  ) {
    return await this.pageService.create({
      ...createPageDto,
      userId: new Types.ObjectId(context.userPayload._id.toString()),
      organizationId: new Types.ObjectId(context.userPayload.organizationId),
    });
  }

  @UseGuards(AuthGuard)
  @MessagePattern('pages.findAllPages')
  async findAll(
    @Ctx() context: IUserContext,
    @Payload() payload: { options: PaginateOptions },
  ) {
    return await this.pageService.findAll({
      filters: {
        organizationId: new Types.ObjectId(context.userPayload.organizationId),
      },
      options: payload.options,
    });
  }

  @MessagePattern('pages.findOnePage')
  async findOne(@Payload() payload: mongoose.RootFilterQuery<Page>) {
    for (const key in payload) {
      if (mongoose.Types.ObjectId.isValid(payload[key].toString())) {
        payload[key] = new mongoose.Types.ObjectId(payload[key].toString());
      }
    }
    const response = await this.pageService.findOne(payload);
    if (!response) throw new NotFoundException('Page not found');
    return response;
  }

  @MessagePattern('pages.updatePage')
  async update(@Payload() updatePageDto: UpdatePageDto) {
    return await this.pageService.update({
      filters: { slug: updatePageDto.slug },
      updatePageDto,
    });
  }
  @UseGuards(AuthGuard)
  @MessagePattern('pages.deletePage')
  async delete(
    @Payload() payload: mongoose.RootFilterQuery<Page>,
    @Ctx() context: IUserContext,
  ) {
    const objectIdFields = ['_id', 'userId', 'organizationId'];

    for (const key in payload) {
      if (!objectIdFields.includes(key)) {
        delete payload[key];
        continue;
      }

      if (
        typeof payload[key] === 'string' &&
        mongoose.Types.ObjectId.isValid(payload[key].toString())
      ) {
        payload[key] = new mongoose.Types.ObjectId(payload[key].toString());
      }
    }

    return await this.pageService.delete({
      ...payload,
      organizationId: new Types.ObjectId(context.userPayload.organizationId),
    });
  }
}
