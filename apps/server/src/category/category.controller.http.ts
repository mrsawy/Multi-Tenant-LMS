import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginateOptionsWithSearch } from 'src/utils/types/PaginateOptionsWithSearch';

@Controller('category')
export class CategoryHttpController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/filtered')
  async getFilteredCategories(@Query() payload: PaginateOptionsWithSearch) {
    if (!payload.search?.trim()) {
      return await this.categoryService.getAllFlat({
        limit: payload.limit || 10,
      });
    }
    return await this.categoryService.getAllFlat(payload);
  }
}
