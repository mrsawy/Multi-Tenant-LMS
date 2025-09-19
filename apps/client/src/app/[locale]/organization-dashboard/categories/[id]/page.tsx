import React from 'react';
import CategoryDetailPage from '../__components/single-category-view';
import { getCategory } from '@/lib/actions/category/category.action';

const CategoryPage: React.FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
    const categoryId = (await params).id;
    const category = await getCategory(categoryId)
    return (
        <div>
            <CategoryDetailPage categoryData={category} />
        </div>
    );
};

export default CategoryPage;