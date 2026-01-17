'use client';

import { Label } from '@/components/atoms/label';
import { Combobox } from '@/components/molecules/combobox';
import { useFilteredCategories } from '@/lib/hooks/category/use-category.hook';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { ICategory } from '@/lib/types/category/ICategory';
import { withDefaults } from '@/lib/types/Paginated';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface CategoryComboboxProps {
    value?: string;
    onValueChange?: (value: string) => void;
    label?: string;
    className?: string;
}

const CategoryCombobox: React.FC<CategoryComboboxProps> = ({
    value,
    onValueChange,
    label,
    className,
}) => {
    const t = useTranslations('Instructors');
    const [searchCategories, setSearchCategories] = useState<string>('');
    const debouncedSearch = useDebounce(searchCategories, 400);
    const filteredCategories = useFilteredCategories();

    useEffect(() => {
        if (debouncedSearch !== undefined) {
            filteredCategories.mutate(withDefaults({ search: debouncedSearch }));
        }
    }, [debouncedSearch]);

    const categoryOptions = Array.from(
        new Map(
            (filteredCategories?.data?.docs ?? []).map((cat: ICategory) => [
                cat.name, // key (label)
                { value: cat._id, label: cat.name }, // value
            ])
        ).values()
    );

    const displayLabel = label || t('category');

    return (
        <div className={className}>
            <Label className='text-lms-text-primary font-medium mb-3 block'>
                {displayLabel}
            </Label>
            <Combobox
                isLoading={filteredCategories.isPending}
                placeholder={t('searchCategoryPlaceholder')}
                data={categoryOptions as { value: string; label: string; }[] || []}
                title={t('filterByCategory')}
                onSearch={(searchValue) => setSearchCategories(searchValue)}
                customTitleBeforeSearch={t('typeToSearchCategories')}
                value={value}
                onValueChange={onValueChange}
            />
        </div>
    );
};

export default CategoryCombobox;
