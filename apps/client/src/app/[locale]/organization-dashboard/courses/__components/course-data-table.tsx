"use client"

import React, { useState, useMemo, useCallback } from 'react'
import { DataTable } from "@/components/molecules/data-table";
import { ICourse, PricingDetails } from '@/lib/types/course/course.interface';
import { ColumnDef } from "@tanstack/react-table"
import {
    type UniqueIdentifier,
} from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { Button } from '@/components/atoms/button';
import { IconDotsVertical, IconGripVertical, IconSearch } from '@tabler/icons-react';
import { Checkbox } from '@/components/atoms/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/atoms/dialog"
import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { Plus, PlusIcon, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'
import CreateCourseForm from './course-form';
import { Badge } from '@/components/atoms/badge';
import { BillingCycle } from '@/lib/types/course/enum/BillingCycle.enum';
import { ModulesCountCell } from './modules-count-cell';
import { getFileFullUrl } from '@/lib/utils/getFileFullUrl';
import { useTranslations } from 'next-intl';

function CourseDataTable({ courses }: { courses: ICourse[] }) {
    const t = useTranslations('CourseDataTable');
    const [courseList, setCourseList] = React.useState<ICourse[]>(courses || [])
    const [openRowId, setOpenRowId] = useState<string | null>(null);
    const [tempDescription, setTempDescription] = useState<string>('');
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [pricingDialogOpen, setPricingDialogOpen] = useState<boolean>(false);
    const [selectedCoursePricing, setSelectedCoursePricing] = useState<ICourse['pricing'] | null>(null);
    const [selectedCourseName, setSelectedCourseName] = useState<string>('');
    // const [createCourseDialogIsOpen, setCreateCourseDialogIsOpen] = useState<boolean>(false)

    React.useEffect(() => {
        setCourseList(courses || [])
    }, [courses])

    // Create a separate component for the drag handle
    const DragHandle = React.memo(({ id }: { id: UniqueIdentifier }) => {
        const { attributes, listeners } = useSortable({ id })
        return (
            <Button
                {...attributes}
                {...listeners}
                variant="ghost"
                size="icon"
                className="text-muted-foreground size-7 hover:bg-transparent"
            >
                <IconGripVertical className="text-muted-foreground size-3" />
                <span className="sr-only">{t('ariaLabels.dragToReorder')}</span>
            </Button>
        )
    });

    const deleteSelected = useCallback((ids: string[]) => {
        // console.log({ ids })
        // setCourseList((prev) => prev.filter((course) => !ids.includes(course._id?.toString() || '')))
    }, []);

    // Handle opening the dialog and initializing temp description
    const handleOpenDialog = useCallback((courseId: string) => {
        const course = courseList.find(c => c._id?.toString() === courseId);
        if (course) {
            setTempDescription(course.description || '');
            setOpenRowId(courseId);
        }
    }, [courseList]);

    // Handle closing dialog and resetting temp state
    const handleCloseDialog = useCallback(() => {
        setOpenRowId(null);
        setTempDescription('');
    }, []);

    // Handle saving changes
    const handleSaveDescription = useCallback((courseId: string) => {
        setCourseList(prev => prev.map(course =>
            course._id?.toString() === courseId
                ? { ...course, description: tempDescription }
                : course
        ));
        handleCloseDialog();
    }, [tempDescription, handleCloseDialog]);

    // Handle opening pricing dialog
    const handleOpenPricingDialog = useCallback((course: ICourse) => {
        setSelectedCoursePricing(course.pricing);
        setSelectedCourseName(course.name);
        setPricingDialogOpen(true);
    }, []);

    // Handle closing pricing dialog
    const handleClosePricingDialog = useCallback(() => {
        setPricingDialogOpen(false);
        setSelectedCoursePricing(null);
        setSelectedCourseName('');
    }, []);

    // Memoize columns to prevent re-renders
    const columns: ColumnDef<ICourse>[] = useMemo(() => [


        {
            id: "select",
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label={t('ariaLabels.selectAll')}
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label={t('ariaLabels.selectRow')}
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: t('columns.courseName'),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-3">
                        {row.original.thumbnailKey && (
                            <img
                                src={getFileFullUrl(row.original.thumbnailKey)}
                                alt={row.original.name}
                                className="w-10 h-10 rounded object-cover"
                            />
                        )}
                        <div>
                            <h3 className="font-medium">{row.original.name}</h3>
                            <p className="text-sm text-muted-foreground">{row.original.shortDescription}</p>
                        </div>
                    </div>
                )
            },
            enableHiding: false,
        },
        {
            accessorKey: "description",
            header: t('columns.description'),
            cell: ({ row }) => {
                return (
                    <Button
                        variant="outline"
                        onClick={() => handleOpenDialog(row.original._id?.toString() || '')}
                    >
                        {t('buttons.view')}
                    </Button>
                )
            }
        },
        {
            accessorKey: "isPaid",
            header: t('columns.type'),
            cell: ({ row }) => {
                return (
                    <Badge variant={row.original.isPaid ? "default" : "secondary"}>
                        {row.original.isPaid ? t('badges.paid') : t('badges.free')}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "pricing",
            header: t('columns.price'),
            cell: ({ row }) => {
                if (!row.original.isPaid) {
                    return <span className="text-green-600 font-medium">{t('badges.free')}</span>
                }

                const pricing = row.original.pricing;

                // Show the first available price in the pricing object, or '-' if not available
                const priceEntry = Object.entries(pricing)[0];
                if (priceEntry) {
                    const [key, value]: [string, PricingDetails] = priceEntry;
                    return (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenPricingDialog(row.original)}
                            className="text-left justify-start h-auto p-2"
                        >
                            <div className="text-left">
                                <div className="font-medium">
                                    {value.originalPrice} {value.originalCurrency}
                                </div>
                                {value.priceUSD && (
                                    <div className="text-xs text-muted-foreground">
                                        {value.priceUSD.toFixed(2)} {t('currency.usd')}
                                    </div>
                                )}
                            </div>
                        </Button>
                    );
                }

                return <span className="text-muted-foreground">-</span>
            }
        },
        {
            accessorKey: "stats",
            header: t('columns.enrollments'),
            cell: ({ row }) => {
                const enrollments = row.original.stats?.totalEnrollments || 0;
                return <span className="font-medium">{enrollments}</span>
            }
        },
        {
            accessorKey: "modulesIds",
            header: t('columns.modules'),
            cell: ({ row }) => {
                return <ModulesCountCell courseId={row.original._id?.toString() || ''} />
            }
        },
        {
            accessorKey: "publishedAt",
            header: t('columns.status'),
            cell: ({ row }) => {
                const isPublished = !!row.original.publishedAt;
                return (
                    <Badge variant={isPublished ? "default" : "outline"}>
                        {isPublished ? t('badges.published') : t('badges.draft')}
                    </Badge>
                )
            }
        },
        {
            id: "actions",
            accessorKey: "actions",
            header: t('columns.actions'),
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                        >
                            <IconDotsVertical />
                            <span className="sr-only">{t('ariaLabels.openMenu')}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                        <Link href={`/organization-dashboard/courses/${row.original._id}`} className='cursor-pointer'>
                            <DropdownMenuItem>
                                {t('buttons.edit')}
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem>
                            <Link href={`/organization-dashboard/courses/${row.original._id}/modules`}>
                                {t('buttons.manageModules')}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">{t('buttons.delete')}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [handleOpenDialog, handleOpenPricingDialog, t]);

    return (
        <div className="space-y-4 ">
            <div className="flex justify-between items-center p-5">
                <h2 className="text-xl font-medium">{t('title')}</h2>
                <Link href="/organization-dashboard/courses/create" >
                    <Button variant="default">
                        <PlusIcon />{t('addCourse')}</Button>
                </Link>
            </div>
            {/* Search Input */}
            <div className="flex items-center space-x-2 p-5">
                <div className="relative flex-1 max-w-sm ms-auto ">
                    <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('searchPlaceholder')}
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <DataTable<ICourse>
                data={courseList}
                columns={columns}
                getRowId={(row) => row._id?.toString() || ''}
                onDeleteSelected={deleteSelected}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                onChangeData={setCourseList}
            />

            {/* Description Dialog */}
            <Dialog
                open={!!openRowId}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCloseDialog();
                    }
                }}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('dialogs.description.title')}</DialogTitle>
                        <DialogDescription>
                            {t('dialogs.description.description')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t('dialogs.description.label')}</label>
                        <Textarea
                            value={tempDescription}
                            onChange={(e) => setTempDescription(e.target.value)}
                            placeholder={t('dialogs.description.placeholder')}
                            className="w-full"
                            rows={6}
                        />
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleCloseDialog}>{t('buttons.cancel')}</Button>
                        </DialogClose>
                        <Button
                            type="button"
                            onClick={() => openRowId && handleSaveDescription(openRowId)}
                        >
                            {t('buttons.saveChanges')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Pricing Details Dialog */}
            <Dialog
                open={pricingDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleClosePricingDialog();
                    }
                }}
            >
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{t('dialogs.pricing.title')}</DialogTitle>
                        <DialogDescription>
                            {t('dialogs.pricing.description', { courseName: selectedCourseName })}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {selectedCoursePricing && Object.entries(selectedCoursePricing).length > 0 ? (
                            <div className="space-y-4">
                                {Object.entries(selectedCoursePricing).map(([billingCycle, pricingDetails]) => (
                                    <div key={billingCycle} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-semibold capitalize">
                                                {t('dialogs.pricing.plan', { billingCycle })}
                                            </h3>
                                            <Badge variant="outline">
                                                {billingCycle}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    {t('dialogs.pricing.originalPrice')}
                                                </label>
                                                <p className="text-lg font-semibold">
                                                    {pricingDetails.originalPrice} {pricingDetails.originalCurrency}
                                                </p>
                                            </div>

                                            {pricingDetails.priceUSD && (
                                                <div>
                                                    <label className="text-sm font-medium text-muted-foreground">
                                                        {t('dialogs.pricing.usdPrice')}
                                                    </label>
                                                    <p className="text-lg font-semibold">
                                                        ${pricingDetails.priceUSD.toFixed(2)} {t('currency.usd')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {pricingDetails.discountPercentage && (
                                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                                        {t('dialogs.pricing.discountAvailable')}
                                                    </span>
                                                    <Badge variant="default" className="bg-green-600">
                                                        {pricingDetails.discountPercentage}% {t('dialogs.pricing.off')}
                                                    </Badge>
                                                </div>

                                                {pricingDetails.discountStartDate && pricingDetails.discountEndDate && (
                                                    <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                                                        {t('dialogs.pricing.validFrom', {
                                                            startDate: new Date(pricingDetails.discountStartDate).toLocaleDateString(),
                                                            endDate: new Date(pricingDetails.discountEndDate).toLocaleDateString()
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">{t('dialogs.pricing.noPricingInfo')}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleClosePricingDialog}>
                                {t('buttons.close')}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CourseDataTable
