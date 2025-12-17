import { BadRequestException, Injectable } from '@nestjs/common';
import mongoose, { PaginateModel } from 'mongoose';
import { Page } from './entities/page.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PageService {
  constructor(@InjectModel(Page.name) private PageModel: PaginateModel<Page>) {}

  async create(createPageDto: CreatePageDto) {
    return await this.PageModel.create(createPageDto);
  }

  async findAll({
    filters,
    options,
  }: {
    filters: mongoose.FilterQuery<Page>;
    options: mongoose.PaginateOptions;
  }) {
    return await this.PageModel.paginate(filters, options);
  }

  async findOne(filters: mongoose.FilterQuery<Page>) {
    return await this.PageModel.findOne(filters);
  }

  update({
    filters,
    updatePageDto,
  }: {
    filters: mongoose.FilterQuery<Page>;
    updatePageDto: UpdatePageDto;
  }) {
    return this.PageModel.findOneAndUpdate(filters, updatePageDto, {
      new: true,
    });
  }

  async delete(filters: mongoose.FilterQuery<Page>) {
    const result = await this.PageModel.deleteOne(filters);
    console.log({ result, filters });
    if (!result.deletedCount) {
      throw new BadRequestException("Couldn't find page to delete");
    }
  }
}
