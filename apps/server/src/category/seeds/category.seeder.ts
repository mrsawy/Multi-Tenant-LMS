import { Model, Types, HydratedDocument } from 'mongoose';
import { Category } from '../entities/category.entity';
import { fakerAR as faker } from '@faker-js/faker';

export class CategorySeeder {
  constructor(
    private readonly categoryModel: Model<Category>,
  ) { }

  /**
   * Seed a single category
   */
  async seedCategory(
    organizationId: Types.ObjectId,
    name: string,
    description?: string,
    parentId?: Types.ObjectId | null,
  ) {
    const category = await this.categoryModel.create({
      organizationId,
      name,
      description: description || faker.lorem.sentence(),
      parentId: parentId || null,
    });
    return category;
  }

  /**
   * Seed multiple categories by name
   */
  async seedCategoriesByName(
    organizationId: Types.ObjectId,
    categoryNames: string[],
  ): Promise<Category[]> {
    const categories: Category[] = [];
    for (const name of categoryNames) {
      const category = await this.seedCategory(organizationId, name);
      categories.push(category);
    }
    return categories;
  }

  /**
   * Seed categories and return a map of name to category
   */
  async seedCategoriesMap(
    organizationId: Types.ObjectId,
    categoryNames: string[],
  ): Promise<Map<string, Category>> {
    const categories = await this.seedCategoriesByName(organizationId, categoryNames);
    const categoryMap = new Map<string, Category>();
    categories.forEach(cat => {
      categoryMap.set(cat.name, cat);
    });
    return categoryMap;
  }

  /**
   * Get or create categories by name (useful for ensuring categories exist)
   */
  async getOrCreateCategories(
    organizationId: Types.ObjectId,
    categoryNames: string[],
  ): Promise<HydratedDocument<Category>[]> {
    const categories: HydratedDocument<Category>[] = [];

    for (const name of categoryNames) {
      let category = await this.categoryModel.findOne({
        organizationId,
        name,
      }).exec();

      if (!category) {
        category = await this.seedCategory(organizationId, name);
      }

      categories.push(category);
    }

    return categories;
  }
}