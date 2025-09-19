export interface ICategory {
    _id: string;
    name: string,
    description: string,
    parentId?: string | null,
    organizationId?: string, // Assuming organizationId is a required field for the category entity
    childCategories: ICategory[],
    parentCategory?: ICategory,
    createdAt:Date | string,
    updatedAt:Date | string

}