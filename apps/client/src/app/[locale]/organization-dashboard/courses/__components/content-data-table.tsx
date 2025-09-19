"use client"

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { DataTable } from "@/components/molecules/data-table";
import { ColumnDef } from "@tanstack/react-table"
import { IContent } from '@/lib/types/course/content.interface';

import { Button } from '@/components/atoms/button';
import { IconDotsVertical, IconGripVertical, IconSearch } from '@tabler/icons-react';
import { Checkbox } from '@/components/atoms/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/atoms/dialog"
import { Input } from '@/components/atoms/input';
import { Plus, PlusIcon, X, Eye, Download, FileText, Video, Image, Music, File } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/atoms/dropdown-menu'
import { SortableRowHandleContext } from '@/components/molecules/data-table'; 

import { getFileFullUrl } from '@/lib/utils/getFileFullUrl';
import { useContentByModule, useDeleteContent, useDeleteContents } from '@/lib/hooks/course/useContent';

// Content type icon mapping
const getContentTypeIcon = (contentType: string) => {
    const type = contentType?.toLowerCase();
    if (type?.includes('video')) return <Video className="h-4 w-4 text-blue-500" />;
    if (type?.includes('image')) return <Image className="h-4 w-4 text-green-500" />;
    if (type?.includes('audio')) return <Music className="h-4 w-4 text-purple-500" />;
    if (type?.includes('text') || type?.includes('document')) return <FileText className="h-4 w-4 text-gray-500" />;
    return <File className="h-4 w-4 text-gray-400" />;
};

interface ContentDataTableProps {
    courseId: string;
    moduleId: string;
}

function ContentDataTable({ courseId, moduleId }: ContentDataTableProps) {
    const [openRowId, setOpenRowId] = useState<string | null>(null);
    const [tempDescription, setTempDescription] = useState<string>('');
    const [globalFilter, setGlobalFilter] = useState<string>('');

    // Use custom hooks for content management
    const { data: moduleWithContent, isLoading, error } = useContentByModule(moduleId || '');

    const [contents, setContents] = useState<IContent[]>([]);
    const emptyRef = useRef<IContent[]>([]);
    const normalizedContentData = useMemo(() => moduleWithContent?.contents ?? emptyRef.current, [moduleWithContent]);

    useEffect(() => {
        setContents(normalizedContentData);
        console.log({ normalizedContentData });
    }, [normalizedContentData]);


    useEffect(() => {
        console.log({ moduleWithContent });
    }, [moduleWithContent]);




    const deleteContentsMutation = useDeleteContents();
    const deleteContentMutation = useDeleteContent();
    // const updateContentMutation = useUpdateContent();

    // Create a separate component for the drag handle
    const DragHandle = React.memo(() => {
        const ctx = React.useContext(SortableRowHandleContext);
        return (
            <div
                {...(ctx?.attributes ?? {})}
                {...(ctx?.listeners ?? {})}
                className="text-muted-foreground size-7 flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
                <IconGripVertical className="text-muted-foreground size-3" />
                <span className="sr-only">Drag to reorder</span>
            </div>
        );
    });

    const deleteSelected = useCallback((ids: string[]) => {
        deleteContentsMutation.mutate(ids);
    }, [deleteContentsMutation]);

    const handleReorder = useCallback((newContents: IContent[]) => {
        setContents(newContents);
        // TODO: Add API call to update content order on the server
        // updateContentOrderMutation.mutate(newContents.map((content, index) => ({ id: content._id, order: index })));
    }, []);

    const handleDeleteContent = useCallback((contentId: string) => {
        deleteContentMutation.mutate(contentId);
    }, [deleteContentMutation]);

    // Handle opening the dialog and initializing temp description
    const handleOpenDialog = useCallback((contentId: string) => {
        const content = contents.find(c => c._id === contentId);
        if (content) {
            setTempDescription(content.description || '');
            setOpenRowId(contentId);
        }
    }, [contents]);

    // Handle closing dialog and resetting temp state
    const handleCloseDialog = useCallback(() => {
        setOpenRowId(null);
        setTempDescription('');
    }, []);

    // Handle saving changes
    const handleSaveDescription = useCallback((contentId: string) => {
        // updateContentMutation.mutate({
        //     contentId,
        //     updateData: { description: tempDescription }
        // });
        // handleCloseDialog();
    }, [tempDescription, handleCloseDialog]);

    // Format file size
    const formatFileSize = useCallback((bytes: number) => {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }, []);

    // Format duration (if available)
    const formatDuration = useCallback((seconds: number) => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    // Memoize columns to prevent re-renders
    const columns: ColumnDef<IContent>[] = useMemo(() => [
        {
            id: "drag",
            header: () => null,
            cell: ({ row }) => <DragHandle />,
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
                return (
                    <div className="flex items-center gap-2">
                        {getContentTypeIcon(row.original.type)}
                        <h3 className="font-medium">{row.original.title}</h3>
                    </div>
                );
            },
            enableHiding: false,
        },
        {
            accessorKey: "contentType",
            header: "Type",
            cell: ({ row }) => (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {row.original.type}
                </span>
            )
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <div className="max-w-xs">
                    <p className="truncate text-sm text-muted-foreground">
                        {row.original.description || 'No description'}
                    </p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(row.original._id)}
                        className="mt-1 h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                    >
                        Edit description
                    </Button>
                </div>
            )
        },
        // {
        //     accessorKey: "fileSize",
        //     header: "File Size",
        //     cell: ({ row }) => {
        //         const fileSize = row.original.fileSize;
        //         return (
        //             <span className="text-sm">
        //                 {formatFileSize(fileSize)}
        //             </span>
        //         );
        //     }
        // },
        // {
        //     accessorKey: "duration",
        //     header: "Duration",
        //     cell: ({ row }) => {
        //         const duration = row.original.duration;
        //         return (
        //             <span className="text-sm">
        //                 {formatDuration(duration)}
        //             </span>
        //         );
        //     }
        // },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => {
                const date = new Date(row.original.createdAt);
                return (
                    <span className="text-sm text-muted-foreground">
                        {date.toLocaleDateString()}
                    </span>
                );
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
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Link
                                href={`/organization-dashboard/courses/${courseId}/modules/${moduleId}/content/${row.original._id}/edit`}
                                className="flex items-center"
                            >
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        {row.original.fileKey && (
                            <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                <a
                                    href={getFileFullUrl(row.original.fileKey)}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Download
                                </a>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteContent(row.original._id)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [handleOpenDialog, handleDeleteContent, formatFileSize, formatDuration, courseId, moduleId]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center p-5">
                    <h2 className="text-xl font-medium">Content</h2>
                </div>
                <div className="flex items-center justify-center p-8">
                    <div className="text-muted-foreground">Loading content...</div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center p-5">
                    <h2 className="text-xl font-medium">Content</h2>
                </div>
                <div className="flex items-center justify-center p-8">
                    <div className="text-red-500">Error loading content: {error.message}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center p-5">
                <h2 className="text-xl font-medium">Content</h2>
                <Link href={`/organization-dashboard/courses/${courseId}/modules/${moduleId}/content/add-new`} className='cursor-pointer'>
                    <Button variant="default">
                        <PlusIcon />Add Content
                    </Button>
                </Link>

            </div>

            {/* Search Input */}
            <div className="flex items-center space-x-2 p-5">
                <div className="relative flex-1 max-w-sm ms-auto">
                    <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search content..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <DataTable<IContent>
                data={contents}
                columns={columns}
                onReorder={handleReorder}
                getRowId={(row) => row._id}
                onDeleteSelected={deleteSelected}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                onChangeData={setContents}
                pageSize={100}
            />

            {/* Description Edit Dialog */}
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
                        <DialogTitle>Edit Description</DialogTitle>
                        <DialogDescription>
                            Update the content description
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                value={tempDescription}
                                onChange={(e) => setTempDescription(e.target.value)}
                                placeholder="Enter content description"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
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
        </div>
    );
}

export default ContentDataTable;