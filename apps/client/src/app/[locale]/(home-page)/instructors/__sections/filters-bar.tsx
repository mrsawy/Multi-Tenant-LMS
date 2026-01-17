'use client';

import { Label } from '@/components/atoms/label';
import { Slider } from '@/components/atoms/slider';
import { Button } from '@/components/atoms/button';
import React from 'react';
import { ArrowRightIcon, X } from 'lucide-react';
import { IInstructorFilters } from '@/lib/types/instructor/IInstructorFilters';
import { useTranslations } from 'next-intl';
import CategoryCombobox from '@/components/molecules/category-combobox';

const FiltersBar: React.FC<{
    filters: IInstructorFilters;
    setFilters: React.Dispatch<React.SetStateAction<IInstructorFilters>>;
    onSubmit?: () => void;
    onReset?: () => void;
}> = ({ filters, setFilters, onSubmit, onReset }) => {
    const t = useTranslations('Instructors');

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit();
        }
    };

    return (
        <div className='flex flex-col gap-6 mx-auto w-full max-w-2xl'>
            <div className='lg:flex-row gap-4 md:gap-24 items-start lg:items-center flex flex-col lg:flex-nowrap'>
                {/* Category Filter */}
                <CategoryCombobox
                    value={filters.selectedCategory}
                    onValueChange={(categoryId) => {
                        setFilters((prev) => ({ ...prev, selectedCategory: categoryId }));
                    }}
                />

                <div className='flex flex-col gap-4 flex-nowrap w-full'>
                    {/* Rating Filter */}
                    <div>
                        <Label className='text-lms-text-primary font-medium mb-3 block'>
                            {t('minimumRating')}: {filters.minRating || 0}+
                        </Label>
                        <div className='flex flex-row gap-4 items-center'>
                            <Slider
                                value={[filters.minRating || 0]}
                                onValueChange={(value) => setFilters((p) => ({ ...p, minRating: value[0] }))}
                                max={5}
                                step={0.5}
                                className='w-56 lg:w-md'
                            />
                            <span className='text-sm text-gray-600 min-w-[3rem] whitespace-nowrap'>{filters.minRating || 0}+ ⭐</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit and Reset Buttons */}
            <div className='flex justify-end gap-3 py-4 border-t border-gray-200'>
                <Button
                    onClick={onReset}
                    variant='outline'
                    type='button'
                    effect={"expandIcon"}
                    icon={<X />}
                    iconPlacement={'right'}

                >
                    {t('resetFilters')}
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="default"
                    effect={'expandIcon'}
                    icon={ArrowRightIcon}
                    iconPlacement={'right'}
                >
                    {t('applyFilters')}
                </Button>
            </div>
        </div>
    );
};

export default FiltersBar;
