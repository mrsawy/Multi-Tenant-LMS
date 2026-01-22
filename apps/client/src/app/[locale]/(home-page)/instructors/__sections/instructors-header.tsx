'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { cn } from '@/lib/utils';
import FiltersBar from './filters-bar';
import { IInstructorFilters } from '@/lib/types/instructor/IInstructorFilters';
import { useRouter, useSearchParams } from 'next/navigation';
import { IInstructor, IUser } from '@/lib/types/user/user.interface';
import InstructorCard4 from '../__components/instructor-card-4';
import { useTranslations } from 'next-intl';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useInstructors } from '@/lib/hooks/instructor/useInstructors';
import { Typography } from '@/components/atoms/typography';

const InstructorsHeaderSection: React.FC = () => {
    const t = useTranslations('Instructors');
    const [showFilters, setShowFilters] = useState(false);
    const searchParams = useSearchParams();
    const route = useRouter();

    // Active filters used for querying (only updated when applied)
    const [activeFilters, setActiveFilters] = useState<IInstructorFilters>({
        page: Number(searchParams.get('page')) || 1,
        limit: Number(searchParams.get('limit')) || 12,
        search: searchParams.get('search') || undefined,
        minRating: Number(searchParams.get('minRating')) || undefined,
        searchCategories: searchParams.get('searchCategories') || undefined,
        selectedCategory: searchParams.get('selectedCategory') || undefined,
    });

    // Draft filters for UI inputs (can change without triggering queries)
    const [draftFilters, setDraftFilters] = useState<IInstructorFilters>({
        ...activeFilters,
    });

    const debouncedSearch = useDebounce(draftFilters.search, 400);

    // Update active search when debounced value changes
    useEffect(() => {
        setActiveFilters((prev) => ({
            ...prev,
            search: debouncedSearch,
        }));
    }, [debouncedSearch]);

    // Use infinite query hook - only uses activeFilters (not draftFilters)
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInstructors(
        {
            ...activeFilters,
            searchCategories: undefined, // Never include searchCategories in query
            page: 1, // Always start from page 1 for infinite query
        },
        12
    );

    // Flatten all pages into a single array
    const instructors: IInstructor[] = data?.pages.flatMap((page) => page.docs || []) || [];

    useEffect(() => {
        // Only update URL when debounced search changes (not when other filters change)
        const currentSearch = searchParams.get('search') || undefined;
        const normalizedDebouncedSearch = debouncedSearch || undefined;

        // Only navigate if the debounced search value is different from the current URL param
        if (normalizedDebouncedSearch !== currentSearch) {
            const params = new URLSearchParams(
                Object.entries({ ...activeFilters, search: normalizedDebouncedSearch })
                    .filter(([key, value]) => key !== 'searchCategories' && value !== undefined && value !== '')
                    .reduce((acc, [key, value]) => {
                        acc[key] = String(value);
                        return acc;
                    }, {} as Record<string, string>)
            );
            route.push(`/instructors?${params.toString()}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    // Intersection Observer for infinite scroll
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Apply draft filters to active filters
        setActiveFilters((prev) => ({
            ...prev,
            search: draftFilters.search,
        }));

        const params = new URLSearchParams(
            Object.entries({ ...activeFilters, search: draftFilters.search })
                .filter(([key, value]) => key !== 'searchCategories' && value !== undefined && value !== '')
                .reduce((acc, [key, value]) => {
                    acc[key] = String(value);
                    return acc;
                }, {} as Record<string, string>)
        );
        route.push(`/instructors?${params.toString()}`);
    };

    const handleApplyFilters = () => {
        // Apply draft filters to active filters (this will trigger a refetch)
        // Use current draftFilters values, not debounced (since user clicked Apply)
        setActiveFilters((prev) => ({
            ...prev,
            minRating: draftFilters.minRating,
            selectedCategory: draftFilters.selectedCategory,
        }));

        const params = new URLSearchParams(
            Object.entries({ ...activeFilters, minRating: draftFilters.minRating, selectedCategory: draftFilters.selectedCategory })
                .filter(([key, value]) => key !== 'searchCategories' && value !== undefined && value !== '')
                .reduce((acc, [key, value]) => {
                    acc[key] = String(value);
                    return acc;
                }, {} as Record<string, string>)
        );
        route.push(`/instructors?${params.toString()}`);
    };

    const handleResetFilters = () => {
        // Reset all filters to default values
        const resetFilters: IInstructorFilters = {
            page: 1,
            limit: 12,
            search: undefined,
            minRating: undefined,
            searchCategories: undefined,
            selectedCategory: undefined,
        };

        // Reset both draft and active filters
        setDraftFilters(resetFilters);
        setActiveFilters(resetFilters);

        // Clear URL params
        route.push('/instructors');
    };

    return (
        <div className=''>
            <div className='bg-gradient-dark border-b border-lms-dark-accent'>
                <div className='container mx-auto px-4 py-8'>
                    <h1 className='text-4xl font-bold text-lms-text-primary mb-2'>{t('title')}</h1>
                    <p className='text-lms-text-secondary text-lg'>{t('description')}</p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className='bg-lms-dark-secondary border-b border-lms-dark-accent'>
                <div className='container mx-auto px-4 py-6'>
                    <form onSubmit={handleSearchSubmit} className='flex flex-col lg:flex-row gap-4 items-center lg:items-center w-full'>
                        <div className='relative flex-1 max-w-2xl w-full'>
                            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-lms-text-muted h-5 w-5' />
                            <Input
                                placeholder={t('searchPlaceholder')}
                                value={draftFilters.search || ''}
                                onChange={(e) => setDraftFilters((prev) => ({ ...prev, search: e.target.value }))}
                                className='pl-10 bg-lms-dark-accent border-lms-dark-accent text-lms-text-primary placeholder:text-lms-text-muted'
                            />
                        </div>

                        <div className='flex flex-wrap gap-3 items-center'>
                            <Button
                                variant='outline'
                                onClick={() => setShowFilters(!showFilters)}
                                type='button'
                            >
                                <Filter className='h-4 w-4 mr-2' />
                                {t('filters')}
                                <ChevronDown className={cn('h-4 w-4 ml-2 transition-transform', showFilters && 'rotate-180')} />
                            </Button>
                        </div>
                    </form>

                    {/* Expanded Filters */}
                    <div className={cn(
                        'mt-6 bg-lms-dark-accent rounded-lg transition-all duration-1000 overflow-hidden flex justify-center',
                        showFilters ? 'max-h-[620px]' : 'max-h-0'
                    )}>
                        <FiltersBar
                            onSubmit={handleApplyFilters}
                            onReset={handleResetFilters}
                            filters={draftFilters}
                            setFilters={setDraftFilters}
                        />
                    </div>

                    {isLoading ? (
                        <div className='flex justify-center items-center py-20'>
                            <Loader2 className='w-8 h-8 text-primary animate-spin' />
                        </div>
                    ) : isError ? (
                        <div className='flex flex-col items-center justify-center py-20 text-center'>
                            <Typography variant="p" color="muted" size="lg" weight="medium" className='mb-2'>
                                {t('errorLoadingInstructors') || 'Error loading instructors'}
                            </Typography>
                            <Typography variant="p" color="muted" size="sm" className='opacity-70'>
                                {t('tryAgainLater') || 'Please try again later.'}
                            </Typography>
                        </div>
                    ) : instructors.length > 0 ? (
                        <>
                            <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto pt-20'>
                                {instructors.map((instructor) => (
                                    <InstructorCard4 key={instructor._id} instructor={instructor} />
                                ))}
                            </div>
                            {/* Infinite scroll trigger */}
                            <div ref={observerTarget} className='h-4 w-full' />
                            {isFetchingNextPage && (
                                <div className='flex justify-center items-center py-8'>
                                    <Loader2 className='w-6 h-6 text-primary animate-spin' />
                                    <Typography variant="span" color="muted" size="sm" className='ml-2'>
                                        {t('loadingMoreInstructors') || 'Loading more instructors...'}
                                    </Typography>
                                </div>
                            )}
                            {!hasNextPage && instructors.length > 0 && (
                                <Typography variant="p" color="muted" size="sm" align="center" className='py-4'>
                                    {t('noMoreInstructors') || 'No more instructors to load'}
                                </Typography>
                            )}
                        </>
                    ) : (
                        <div className='flex flex-col items-center justify-center py-20 text-center'>
                            <Typography variant="p" color="muted" size="lg" weight="medium" className='mb-2'>
                                {t('noInstructorsFound') || 'No instructors found'}
                            </Typography>
                            <Typography variant="p" color="muted" size="sm" className='opacity-70'>
                                {t('tryDifferentFilters') || 'Try adjusting your search or filters'}
                            </Typography>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorsHeaderSection;
