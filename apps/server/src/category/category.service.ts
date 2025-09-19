import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, FilterQuery, PaginateOptions } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
// import { PaginateOptions } from 'src/utils/types/PaginateOptions';
import { CategoryWithChildren } from 'src/utils/types/CategoryWithChildren ';
import { PaginateResult } from 'mongoose';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: PaginateModel<Category>,
  ) { }

  async create(createCategoryDto: CreateCategoryDto & { organizationId: string }) {
    const created = new this.categoryModel(createCategoryDto);
    return created.save();
  }


  async getAllFlat(organizationId: string, options: PaginateOptions) {
    return await this.categoryModel.paginate({ organizationId }, options)
  }
  

  async getAllWithAggregation(organizationId: string, options: PaginateOptions): Promise<PaginateResult<CategoryWithChildren>> {
    const limit = options.limit ?? 10;
    const page = options.page ?? 1;
    const pipeline = [
      { $match: { organizationId: new this.categoryModel.base.Types.ObjectId(organizationId) } },
      { $addFields: { isRoot: { $eq: ['$parentId', null] }, }, },
      { $group: { _id: null, allCategories: { $push: '$$ROOT' }, }, },
      { $project: { rootCategories: { $filter: { input: '$allCategories', cond: { $eq: ['$$this.parentId', null] }, }, }, allCategories: 1, }, },
      { $unwind: '$rootCategories', },
      {
        $addFields: {
          'rootCategories.childCategories': {
            $function: {
              body: function (allCategories: any[], rootId: any) {
                function buildTree(items: any[], parentId: any = null): any[] {
                  return items.filter((item) => {
                    if (!item.parentId) return false; return item.parentId.toString() === (parentId ? parentId.toString() : null);
                  }).map((item) => ({
                    _id: item._id, name: item.name, description: item.description, organizationId: item.organizationId,
                    parentId: item.parentId, createdAt: item.createdAt, updatedAt: item.updatedAt, childCategories: buildTree(items, item._id),
                  }));
                } return buildTree(allCategories, rootId);
              },
              args: ['$allCategories', '$rootCategories._id'],
              lang: 'js',
            },
          },
        },
      }, { $replaceRoot: { newRoot: '$rootCategories', }, }, { $project: { _id: 1, name: 1, description: 1, organizationId: 1, parentId: 1, createdAt: 1, updatedAt: 1, childCategories: 1, }, }, { $skip: (page - 1) * limit }, { $limit: limit },]; const [results, totalCount] = await Promise.all([
        this.categoryModel.aggregate<CategoryWithChildren>(pipeline),
        this.categoryModel.countDocuments({ organizationId: new this.categoryModel.base.Types.ObjectId(organizationId), parentId: null }),
      ]);
    return {
      docs: results,
      totalDocs: totalCount,
      limit,
      page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page * limit < totalCount,
      hasPrevPage: page > 1,
      nextPage: page * limit < totalCount ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      pagingCounter: (page - 1) * limit + 1, offset: (page - 1) * limit,
    };
  }


  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return { success: true, deletedId: id };
  }


  async getCategoryWithRelations(organizationId: string, categoryId: string) {
    const pipeline = [
      // First, get the target category
      {
        $match: {
          _id: new this.categoryModel.base.Types.ObjectId(categoryId),
          organizationId: new this.categoryModel.base.Types.ObjectId(organizationId)
        }
      },
      // Get all categories from the same organization to build the hierarchy
      {
        $lookup: {
          from: 'categories',
          let: { orgId: '$organizationId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$organizationId', '$$orgId'] }
              }
            }
          ],
          as: 'allCategories'
        }
      },
      // Build the hierarchy for this specific category
      {
        $addFields: {
          childCategories: {
            $function: {
              body: function (allCategories: any[], parentId: any): any[] {
                function buildTree(items: any[], currentParentId: any): any[] {
                  return items
                    .filter(item => {
                      if (!item.parentId) return false;
                      return item.parentId.toString() === currentParentId.toString();
                    })
                    .map(item => ({
                      _id: item._id,
                      name: item.name,
                      description: item.description,
                      organizationId: item.organizationId,
                      parentId: item.parentId,
                      createdAt: item.createdAt,
                      updatedAt: item.updatedAt,
                      childCategories: buildTree(items, item._id)
                    }));
                }
                return buildTree(allCategories, parentId);
              },
              args: ['$allCategories', '$_id'],
              lang: 'js'
            }
          }
        }
      },
      // Remove the temporary allCategories field
      {
        $project: {
          allCategories: 0
        }
      }
    ];

    const result = await this.categoryModel.aggregate<CategoryWithChildren>(pipeline);

    if (!result || result.length === 0) {
      throw new NotFoundException(`Category with id ${categoryId} not found`);
    }

    return result[0];
  }
}
