import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, {
  PaginateModel,
  FilterQuery,
  PaginateOptions,
  Query,
} from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { CategoryWithChildren } from 'src/utils/types/CategoryWithChildren ';
import { PaginateResult } from 'mongoose';
import { PaginateOptionsWithSearch } from 'src/utils/types/PaginateOptionsWithSearch';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: PaginateModel<Category>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto & { organizationId: string },
  ) {
    const created = new this.categoryModel(createCategoryDto);
    return created.save();
  }

  async getAllFlat(
    options: PaginateOptionsWithSearch,
    organizationId?: string,
  ) {
    let filters: any = {};
    if (organizationId) {
      filters = { organizationId };
    }
    if (options.search) {
      filters.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { description: { $regex: options.search, $options: 'i' } },
      ];
    }

    console.log({ options });

    return await this.categoryModel.paginate(filters, options);
  }

  async getAllWithAggregation(
    options: PaginateOptionsWithSearch,
    organizationId?: string,
    parentId?: string | mongoose.Types.ObjectId | null,
  ): Promise<PaginateResult<CategoryWithChildren>> {
    const limit = options.limit ?? 10;
    const page = options.page ?? 1;

    let match: any = {};

    if (parentId !== undefined) {
      match.parentId = parentId;
    }

    if (organizationId) {
      match.organizationId = new this.categoryModel.base.Types.ObjectId(
        organizationId,
      );
    }
    if (options.search) {
      match.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { description: { $regex: options.search, $options: 'i' } },
      ];
    }

    console.log({ match });

    const pipeline = [
      {
        $match: match,
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $graphLookup: {
          from: 'categories', // The collection name (adjust if different)
          startWith: '$_id', // Start from the current root category's _id
          connectFromField: '_id', // Connect using the _id field
          connectToField: 'parentId', // To documents where parentId matches
          as: 'allDescendants', // Store all descendants in this array
          depthField: 'level', // Optional: track the depth level
        },
      },

      {
        $addFields: {
          childCategories: {
            $function: {
              body: function (descendants, rootId) {
                var itemMap = {};
                for (var i = 0; i < descendants.length; i++) {
                  var item = descendants[i];
                  itemMap[item._id.valueOf()] = {
                    _id: item._id,
                    name: item.name,
                    description: item.description,
                    organizationId: item.organizationId,
                    parentId: item.parentId,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                    childCategories: [],
                  };
                }

                var directChildren: any[] = [];
                for (var id in itemMap) {
                  var item2 = itemMap[id];
                  if (
                    item2.parentId &&
                    item2.parentId.valueOf() === rootId.valueOf()
                  ) {
                    directChildren.push(item2);
                  } else if (item2.parentId) {
                    var parent = itemMap[item2.parentId.valueOf()];
                    if (parent) {
                      parent.childCategories.push(item2);
                    }
                  }
                }

                return directChildren;
              },
              args: ['$allDescendants', '$_id'],
              lang: 'js',
            },
          },
        },
      },
      {
        $project: {
          allDescendants: 0,
        },
      },
    ];

    const [results, totalCount] = await Promise.all([
      this.categoryModel.aggregate<CategoryWithChildren>(pipeline),
      this.categoryModel.countDocuments({
        organizationId: new this.categoryModel.base.Types.ObjectId(
          organizationId,
        ),
        parentId: null,
      }),
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
      pagingCounter: (page - 1) * limit + 1,
      offset: (page - 1) * limit,
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
          organizationId: new this.categoryModel.base.Types.ObjectId(
            organizationId,
          ),
        },
      },
      // Get all categories from the same organization to build the hierarchy
      {
        $lookup: {
          from: 'categories',
          let: { orgId: '$organizationId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$organizationId', '$$orgId'] },
              },
            },
          ],
          as: 'allCategories',
        },
      },
      // Build the hierarchy for this specific category
      {
        $addFields: {
          childCategories: {
            $function: {
              body: function (allCategories: any[], parentId: any): any[] {
                function buildTree(items: any[], currentParentId: any): any[] {
                  return items
                    .filter((item) => {
                      if (!item.parentId) return false;
                      return (
                        item.parentId.toString() === currentParentId.toString()
                      );
                    })
                    .map((item) => ({
                      _id: item._id,
                      name: item.name,
                      description: item.description,
                      organizationId: item.organizationId,
                      parentId: item.parentId,
                      createdAt: item.createdAt,
                      updatedAt: item.updatedAt,
                      childCategories: buildTree(items, item._id),
                    }));
                }
                return buildTree(allCategories, parentId);
              },
              args: ['$allCategories', '$_id'],
              lang: 'js',
            },
          },
        },
      },
      // Remove the temporary allCategories field
      {
        $project: {
          allCategories: 0,
        },
      },
    ];

    const result =
      await this.categoryModel.aggregate<CategoryWithChildren>(pipeline);

    if (!result || result.length === 0) {
      throw new NotFoundException(`Category with id ${categoryId} not found`);
    }

    return result[0];
  }
}
