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
import CreateCourseForm from './create-course-form';
import { Badge } from '@/components/atoms/badge';
import { BillingCycle } from '@/lib/types/course/enum/BillingCycle.enum';
import { ModulesCountCell } from './modules-count-cell';
import { getFileFullUrl } from '@/lib/utils/getFileFullUrl';

function CourseDataTable({ courses }: { courses: ICourse[] }) {
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
                <span className="sr-only">Drag to reorder</span>
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
            id: "drag",
            header: () => null,
            cell: ({ row }) => <DragHandle id={row.id} />,
        },
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
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: "Course Name",
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
            header: "Description",
            cell: ({ row }) => {
                return (
                    <Button
                        variant="outline"
                        onClick={() => handleOpenDialog(row.original._id?.toString() || '')}
                    >
                        View
                    </Button>
                )
            }
        },
        {
            accessorKey: "isPaid",
            header: "Type",
            cell: ({ row }) => {
                return (
                    <Badge variant={row.original.isPaid ? "default" : "secondary"}>
                        {row.original.isPaid ? "Paid" : "Free"}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "pricing",
            header: "Price",
            cell: ({ row }) => {
                if (!row.original.isPaid) {
                    return <span className="text-green-600 font-medium">Free</span>
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
                                        {value.priceUSD.toFixed(2)} USD
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
            header: "Enrollments",
            cell: ({ row }) => {
                const enrollments = row.original.stats?.totalEnrollments || 0;
                return <span className="font-medium">{enrollments}</span>
            }
        },
        {
            accessorKey: "modulesIds",
            header: "Modules",
            cell: ({ row }) => {
                return <ModulesCountCell courseId={row.original._id?.toString() || ''} />
            }
        },
        {
            accessorKey: "publishedAt",
            header: "Status",
            cell: ({ row }) => {
                const isPublished = !!row.original.publishedAt;
                return (
                    <Badge variant={isPublished ? "default" : "outline"}>
                        {isPublished ? "Published" : "Draft"}
                    </Badge>
                )
            }
        },
        {
            id: "actions",
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                        >
                            <IconDotsVertical />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                        <Link href={`/organization-dashboard/courses/${row.original._id}`} className='cursor-pointer'>
                            <DropdownMenuItem>
                                Edit
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem>
                            <Link href={`/organization-dashboard/courses/${row.original._id}/modules`}>
                                Manage Modules
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [handleOpenDialog, handleOpenPricingDialog]);

    return (
        <div className="space-y-4 ">
            <div className="flex justify-between items-center p-5">
                <h2 className="text-xl font-medium">Courses</h2>
                <Link href="/organization-dashboard/courses/create" >
                    <Button variant="default">
                        <PlusIcon />Add Course</Button>
                </Link>
            </div>
            {/* Search Input */}
            <div className="flex items-center space-x-2 p-5">
                <div className="relative flex-1 max-w-sm ms-auto ">
                    <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
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
                        <DialogTitle>Course Description</DialogTitle>
                        <DialogDescription>
                            Edit the course description
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input
                            value={tempDescription}
                            onChange={(e) => setTempDescription(e.target.value)}
                            placeholder="Enter course description..."
                            className="w-full"
                        />
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                        </DialogClose>
                        <Button
                            type="button"
                            onClick={() => openRowId && handleSaveDescription(openRowId)}
                        >
                            Save changes
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
                        <DialogTitle>Pricing Details</DialogTitle>
                        <DialogDescription>
                            Pricing information for {selectedCourseName}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {selectedCoursePricing && Object.entries(selectedCoursePricing).length > 0 ? (
                            <div className="space-y-4">
                                {Object.entries(selectedCoursePricing).map(([billingCycle, pricingDetails]) => (
                                    <div key={billingCycle} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-semibold capitalize">
                                                {billingCycle} Plan
                                            </h3>
                                            <Badge variant="outline">
                                                {billingCycle}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    Original Price
                                                </label>
                                                <p className="text-lg font-semibold">
                                                    {pricingDetails.originalPrice} {pricingDetails.originalCurrency}
                                                </p>
                                            </div>

                                            {pricingDetails.priceUSD && (
                                                <div>
                                                    <label className="text-sm font-medium text-muted-foreground">
                                                        USD Price
                                                    </label>
                                                    <p className="text-lg font-semibold">
                                                        ${pricingDetails.priceUSD.toFixed(2)} USD
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {pricingDetails.discountPercentage && (
                                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                                        Discount Available
                                                    </span>
                                                    <Badge variant="default" className="bg-green-600">
                                                        {pricingDetails.discountPercentage}% OFF
                                                    </Badge>
                                                </div>

                                                {pricingDetails.discountStartDate && pricingDetails.discountEndDate && (
                                                    <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                                                        Valid from {new Date(pricingDetails.discountStartDate).toLocaleDateString()}
                                                        {' '}to {new Date(pricingDetails.discountEndDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No pricing information available</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleClosePricingDialog}>
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CourseDataTable
