"use client"
import { Label } from '@/components/atoms/label';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { Slider } from '@/components/atoms/slider';
import { Button } from '@/components/atoms/button';
import { Combobox } from '@/components/molecules/combobox';
import { DualRangeSlider } from '@/components/molecules/dual-range-slider';
import { Currency } from '@/lib/data/currency.enum';

import { useFilteredCategories } from '@/lib/hooks/category/use-category.hook';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { ICategory } from '@/lib/types/category/ICategory';

import { withDefaults } from '@/lib/types/Paginated';
import React, { useEffect, useState } from 'react';
import { BillingCycle } from '@/lib/types/course/enum/BillingCycle.enum';
import { ArrowRightIcon } from 'lucide-react';
import { ICourseFilters } from '@/lib/types/course/ICourseFilters';
import { Tabs, TabsList, TabsTrigger } from '@/components/atoms/tabs';



const FiltersBar: React.FC<{
    filters: ICourseFilters,
    setFilters: React.Dispatch<React.SetStateAction<ICourseFilters>>,
    onSubmit?: () => void
}> = ({ filters, setFilters, onSubmit }) => {

    const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);
    const debouncedSearch = useDebounce(filters.searchCategories, 400);
    const filteredCategories = useFilteredCategories();

    useEffect(() => {
        if (debouncedSearch !== undefined) {
            filteredCategories.mutate(withDefaults({ search: debouncedSearch }));
        }
    }, [debouncedSearch]);

    const handleBillingCycleChange = (cycle: BillingCycle) => {
        setSelectedBillingCycle(cycle);
        setFilters((prev: any) => ({ ...prev, billingCycle: cycle }));
    };

    const handleSubmit = () => {
        if (onSubmit) {
            onSubmit();
        }
    };
    const categoryOptions = Array.from(
        new Map(
            (filteredCategories?.data?.docs ?? []).map((cat: ICategory) => [
                cat.name, // key (label)
                { value: cat._id, label: cat.name }, // value
            ])
        ).values()
    );


    return (
        <div className="flex flex-col gap-6 mx-auto">
            <div className="lg:flex-row gap-4 md:gap-24 items-start lg:items-center flex flex-col lg:flex-nowrap">
                {/* Category Filter */}
                <div>
                    <Label className="text-lms-text-primary font-medium mb-3 block">Category</Label>
                    <Combobox
                        isLoading={filteredCategories.isPending}
                        placeholder='Search For Category'
                        data={categoryOptions as { value: string; label: string; }[] || []}
                        title='Filter By Category'
                        onSearch={(value) => setFilters((prev) => ({ ...prev, searchCategories: value }))}
                        customTitleBeforeSearch="Type to search categories"
                        onValueChange={(label) => {
                            setFilters((prev) => ({ ...prev, selectedCategory: label }));
                        }}
                    />
                </div>

                <div className='flex flex-col gap-4 flex-nowrap w-full'>
                    {/* Billing Cycle Selector */}


                    {/* Price Range - Animated */}
                    <div className="overflow-hidden transition-all duration-500 ease-in-out">
                        <div className={`
                            transform transition-all duration-500 ease-in-out
                            ${selectedBillingCycle ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                        `}>
                            <div className='flex flex-row gap-6 mb-7 items-center'>

                                <Label className="text-lms-text-primary font-medium   block">
                                    Price Range<br /> ({selectedBillingCycle === BillingCycle.ONE_TIME ? 'One-Time' :
                                        selectedBillingCycle.charAt(0).toUpperCase() + selectedBillingCycle.slice(1)}):
                                </Label>
                                <div>
                                    <Label className="text-lms-text-primary font-medium mb-3 block">
                                        Billing Cycle
                                    </Label>

                                    <Tabs defaultValue={BillingCycle.MONTHLY} >
                                        <TabsList>
                                            {Object.values(BillingCycle).map((cycle) => (
                                                <TabsTrigger value={cycle} key={cycle} onClick={() => handleBillingCycleChange(cycle)}>
                                                    {cycle === BillingCycle.ONE_TIME ? 'One-Time' :
                                                        cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                                                </TabsTrigger>))}
                                        </TabsList>

                                    </Tabs>

                                </div>
                            </div>
                            <div className='flex flex-row gap-5 items-center'>
                                <DualRangeSlider
                                    label={(value) => value}
                                    value={[filters.minPrice || 0, filters.maxPrice || 5000]}
                                    onValueChange={(v) => { setFilters(p => ({ ...p, minPrice: v[0], maxPrice: v[1] })) }}
                                    min={0}
                                    max={5000}
                                    step={1}
                                    className="w-56 lg:w-md"
                                />
                                <Combobox
                                    defaultValue={{ value: Currency.EGP, label: Currency.EGP }}
                                    data={Object.values(Currency).map(c => ({ value: c, label: c }))}
                                    title="Select Currency"
                                    placeholder="Currency ..."
                                    onValueChange={(value) => setFilters(p => ({ ...p, priceCurrency: value }))}
                                    buttonClassName="w-16 text-sm lg:w-24 lg:text-md lg:ml-4 lg:w-32 p-3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rating Filter */}
                    <div>
                        <Label className="text-lms-text-primary font-medium mb-3 block">
                            Minimum Rating: {filters.minRating || 0}+
                        </Label>
                        <div className='flex flex-row gap-4 items-center'>
                            <Slider
                                value={[filters.minRating || 0]}
                                onValueChange={(value) => setFilters(p => ({ ...p, minRating: value[0] }))}
                                max={5}
                                step={0.5}
                                className="w-56 lg:w-md"
                            />
                            <span className="text-sm text-gray-600 min-w-[3rem]">{filters.minRating || 0}+ ⭐</span>
                        </div>
                    </div>

                    {/* Minimum Modules */}
                    <div>
                        <Label className="text-lms-text-primary font-medium mb-3 block">
                            Minimum Modules: {filters.minModules || 0}+
                        </Label>
                        <div className='flex flex-row gap-4 items-center'>
                            <Slider
                                value={[filters.minModules || 0]}
                                onValueChange={(value) => setFilters(p => ({ ...p, minModules: value[0] }))}
                                max={100}
                                step={1}
                                className="w-56 lg:w-md"
                            />
                            <span className="text-sm text-gray-600 min-w-[3rem]">{filters.minModules || 0}+</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                    onClick={handleSubmit}
                    variant="outline"
                    effect={"expandIcon"}
                    icon={ArrowRightIcon}
                    iconPlacement={"right"}
                >
                    Apply Filters
                </Button>
            </div>
        </div >
    );
};

export default FiltersBar;