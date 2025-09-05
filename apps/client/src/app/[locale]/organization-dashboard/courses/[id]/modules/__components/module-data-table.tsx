"use client"

import React, { useState, useMemo, useCallback } from 'react'
import { DataTable } from "@/components/molecules/data-table";
import { ICourseWithModules } from '@/lib/types/course/courseWithModules.interface';
import { ColumnDef } from "@tanstack/react-table"
import { IModule } from '@/lib/types/course/modules.interface';
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
import CreateModuleForm from './create-module-form';

function ModulesDataTable({ course }: { course: ICourseWithModules }) {
    const [modules, setModules] = React.useState<IModule[]>(course?.modules || [])
    const [openRowId, setOpenRowId] = useState<string | null>(null);
    const [tempObjectives, setTempObjectives] = useState<string[]>([]);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [createModuleDialogIsOpen, setCreateModuleDialogIsOpen] = useState<boolean>(false)

    React.useEffect(() => {
        setModules(course?.modules || [])
    }, [course?.modules])

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
        console.log({ ids })
        // setModules((prev) => prev.filter((module) => !ids.includes(module._id)))
    }, []);

    // Handle opening the dialog and initializing temp objectives
    const handleOpenDialog = useCallback((moduleId: string) => {
        const module = modules.find(m => m._id === moduleId);
        if (module) {
            setTempObjectives([...module.learningObjectives]);
            setOpenRowId(moduleId);
        }
    }, [modules]);

    // Handle closing dialog and resetting temp state
    const handleCloseDialog = useCallback(() => {
        setOpenRowId(null);
        setTempObjectives([]);
    }, []);

    // Handle saving changes
    const handleSaveObjectives = useCallback((moduleId: string) => {
        setModules(prev => prev.map(module =>
            module._id === moduleId
                ? { ...module, learningObjectives: [...tempObjectives] }
                : module
        ));
        handleCloseDialog();
    }, [tempObjectives, handleCloseDialog]);

    // Temp objective management functions
    const removeObjective = useCallback((index: number) => {
        setTempObjectives(prev => prev.filter((_, i) => i !== index));
    }, []);

    const updateObjective = useCallback((index: number, value: string) => {
        setTempObjectives(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    }, []);

    const addObjective = useCallback(() => {
        setTempObjectives(prev => [...prev, ""]);
    }, []);

    // Memoize columns to prevent re-renders
    const columns: ColumnDef<IModule>[] = useMemo(() => [
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
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => {
                return <h3>{row.original.title}</h3>
            },
            enableHiding: false,
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => <h4>{row.original.description}</h4>
        },
        {
            accessorKey: "learningObjectives",
            header: "Learning Objectives",
            cell: ({ row }) => {
                return (
                    <Button
                        variant="outline"
                        onClick={() => handleOpenDialog(row.original._id)}
                    >
                        View
                    </Button>
                )
            }
        },
        {
            accessorKey: "contents",
            header: "Content",
            cell: ({ row }) => {
                return (
                    <Link
                        href={`/organization-dashboard/courses/${course._id}/modules/content`}
                        className=' underline underline-offset-2 text-blue-800 dark:text-blue-400'
                    >
                        View Content
                    </Link>
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
                        <DropdownMenuItem>
                            <Link href={`/organization-dashboard/courses/${course._id}/modules/${row.original._id}`}>
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem>Make a copy</DropdownMenuItem>
                        <DropdownMenuItem>Favorite</DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [handleOpenDialog]);

    return (
        <div className="space-y-4 ">
            {/* Search Input */}
            <div className="flex justify-between items-center p-5">
                <h2 className="text-xl font-medium">Modules</h2>
                <Dialog open={createModuleDialogIsOpen} onOpenChange={setCreateModuleDialogIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="default">
                            <PlusIcon />Add module</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create module</DialogTitle>
                        </DialogHeader>
                        <CreateModuleForm setOpen={setCreateModuleDialogIsOpen} courseId={course._id?.toString() as string} />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="flex items-center space-x-2 p-5">
                <div className="relative flex-1 max-w-sm ms-auto ">
                    <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search modules..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>


            <DataTable<IModule>
                data={modules}
                columns={columns}
                // onReorder={handleReorder}
                getRowId={(row) => row._id}
                onDeleteSelected={deleteSelected}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
            />

            {/* Move Dialog outside of columns */}
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
                        <DialogTitle>Learning Objectives</DialogTitle>
                        <DialogDescription>
                            Goals that User will Gain
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center justify-between">
                        <label className="text-sm">Learning Objectives</label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addObjective}
                            className="flex items-center gap-1"
                        >
                            <Plus className="h-4 w-4" />
                            Add Objective
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {tempObjectives.map((objective, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    value={objective}
                                    onChange={(e) => updateObjective(index, e.target.value)}
                                    placeholder={`Learning objective ${index + 1}`}
                                    className="flex-1"
                                />
                                {tempObjectives.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeObjective(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                        </DialogClose>
                        <Button
                            type="button"
                            onClick={() => openRowId && handleSaveObjectives(openRowId)}
                        >
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ModulesDataTable