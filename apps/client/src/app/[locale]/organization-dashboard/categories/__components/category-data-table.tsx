"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { DataTable } from "@/components/molecules/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/atoms/dialog";
import { Input } from "@/components/atoms/input";
import { PlusIcon, ChevronDown, ChevronRight, Folder, FolderOpen, File } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { IconSearch } from "@tabler/icons-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/atoms/dropdown-menu";
import { useCategoriesByOrganization, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/lib/hooks/category/use-category.hook";
import { ICategory } from "@/lib/types/category/ICategory";
import CreateCategoryForm from "./create-category-form";
import { Paginated } from "@/lib/types/Paginated";
import { cn } from "@/lib/utils";

// Enhanced type for tree node representation
interface CategoryTreeNode extends ICategory {
    level: number;
    isExpanded: boolean;
    hasChildren: boolean;
    parentPath: string[];
    isLastChild: boolean;
    childrenExpanded?: boolean;
}

interface CategoriesDataTableProps {
    organizationId: string;
}

function CategoriesDataTable({ organizationId }: CategoriesDataTableProps) {


    const [defaultParentId, setDefaultParentId] = useState<string | null>(null)
    const [globalFilter, setGlobalFilter] = useState("");
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [createCategoryDialogIsOpen, setCreateCategoryDialogIsOpen] = useState(false);

    const { data: categoriesData, isLoading, error } = useCategoriesByOrganization({
        organizationId,
        page: 1,
        limit: 100,
    });

    const [categories, setCategories] = useState<ICategory[]>([]);

    useEffect(() => {
        setCategories(categoriesData?.docs ?? []);
    }, [categoriesData]);


    const deleteCategoryMutation = useDeleteCategory();


    // Toggle expansion of a specific node
    const toggleExpand = useCallback((nodeId: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    }, []);

    // Collapse all children recursively
    const collapseAllChildren = useCallback((nodeId: string, categories: ICategory[]) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            newSet.delete(nodeId);
            categories.find(c => c._id == nodeId)?.childCategories.map(cat => cat._id).forEach(id => newSet.delete(id));
            return newSet;
        });
    }, []);

    const handleDeleteCategory = useCallback(
        (categoryId: string) => {
            deleteCategoryMutation.mutate({ organizationId, categoryId });
        },
        [deleteCategoryMutation, organizationId]
    );

    // Also, make sure your expand/collapse functions work with the correct data:
    const expandAllChildren = useCallback((nodeId: string, categories: ICategory[]) => {
        setExpandedNodes(prev => new Set([...prev, nodeId, ...(categories.find(c => c._id == nodeId)?.childCategories.map(cat => cat._id) ?? [])]));
    }, []);



    function CategoryNode({ node, toggleExpand }: { node: ICategory, toggleExpand: (id: string) => void }) {
        return (
            <div className="ps-4">
                <div className="relative z-10 flex items-center">
                    {node.childCategories.length > 0 ? (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0  rounded"
                                onClick={() => toggleExpand(node._id)}
                            >
                                {expandedNodes.has(node._id) ? (
                                    <ChevronDown className="h-3 w-3" />
                                ) : (
                                    <ChevronRight className="h-3 w-3" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 rounded "
                                onClick={() => {
                                    if (expandedNodes.has(node._id)) {
                                        collapseAllChildren(node._id, categories);
                                    } else {
                                        expandAllChildren(node._id, categories);
                                    }
                                }}
                                title={expandedNodes.has(node._id) ? "Collapse all children" : "Expand all children"}
                            >
                                {expandedNodes.has(node._id) ? (
                                    <FolderOpen className="h-3 w-3" />
                                ) : (
                                    <Folder className="h-3 w-3" />
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <div className="w-6" /> {/* Spacer */}
                            <File className="h-3 w-3 text-gray-400" />
                        </div>
                    )}
                    <Link href={"/organization-dashboard/categories/" + node._id}>
                        <span className={cn("ml-2 font-medium hover:underline")} >
                            {node.name}
                        </span>
                    </Link>
                </div>
                {expandedNodes.has(node._id) && node.childCategories?.length > 0 && (
                    <div className="pl-4">
                        {node.childCategories.map(child => {
                            return <div className="flex flex-row"> <CategoryNode key={child._id} node={child} toggleExpand={toggleExpand} />

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                            size="icon"
                                        >
                                            <span className="sr-only">Open menu</span>⋮
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem>
                                            <Link href={`/organization-dashboard/categories/${child._id}`}>
                                                Edit Category
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setDefaultParentId(child._id)
                                                setCreateCategoryDialogIsOpen(true);
                                                // TODO: Set parent ID for creating subcategory
                                            }}
                                        >
                                            Add Subcategory
                                        </DropdownMenuItem>
                                        {child.childCategories.length > 0 && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => expandAllChildren(child._id, categories)}
                                                >
                                                    Expand All Children
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => collapseAllChildren(child._id, categories)}
                                                >
                                                    Collapse All Children
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() => handleDeleteCategory(child._id)}
                                        >
                                            Delete Category
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                            </div>
                        })}
                    </div>
                )}
            </div>
        );
    }

    const columns: ColumnDef<ICategory>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <div className="flex items-center justify-center ">
                        <Checkbox
                            checked={
                                table.getIsAllPageRowsSelected() ||
                                (table.getIsSomePageRowsSelected() && "indeterminate")
                            }
                            onCheckedChange={(value) =>
                                table.toggleAllPageRowsSelected(!!value)
                            }
                            aria-label="Select all"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center mb-auto">
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
                header: "Category Name",
                cell: ({ row }) => <CategoryNode node={row.original} toggleExpand={toggleExpand} />
            },

            {
                accessorKey: "description",
                header: "Description",
                cell: ({ row }) => {
                    const node = row.original;
                    return (
                        <span >
                            {node.description || "—"}
                        </span>
                    );
                },
            },

            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const node = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                    size="icon"
                                >
                                    <span className="sr-only">Open menu</span>⋮
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                    <Link href={`/organization-dashboard/categories/${node._id}`}>
                                        Edit Category
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        setDefaultParentId(node._id)
                                        setCreateCategoryDialogIsOpen(true);
                                        // TODO: Set parent ID for creating subcategory
                                    }}
                                >
                                    Add Subcategory
                                </DropdownMenuItem>
                                {node.childCategories.length > 0 && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => expandAllChildren(node._id, categories)}
                                        >
                                            Expand All Children
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => collapseAllChildren(node._id, categories)}
                                        >
                                            Collapse All Children
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => handleDeleteCategory(node._id)}
                                >
                                    Delete Category
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [toggleExpand, handleDeleteCategory, expandAllChildren,
            collapseAllChildren,
            categories]
    );

    if (isLoading) {
        return <div className="p-8 text-muted-foreground">Loading categories…</div>;
    }

    if (error) {
        return (
            <div className="p-8 text-red-500">
                Error loading categories: {error.message}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center p-5">
                <div>
                    <h2 className="text-xl font-medium">Categories</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage your category hierarchy with expandable tree structure
                    </p>
                </div>
                <Dialog
                    open={createCategoryDialogIsOpen}
                    onOpenChange={setCreateCategoryDialogIsOpen}
                >
                    <DialogTrigger asChild>
                        <Button variant="default">
                            <PlusIcon /> Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Category</DialogTitle>
                        </DialogHeader>
                        <CreateCategoryForm
                            setOpen={setCreateCategoryDialogIsOpen}
                            organizationId={organizationId}
                            categories={(categoriesData as Paginated<ICategory>)?.docs || []}
                            parentId={defaultParentId}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedNodes(new Set(categories.map(c => c._id)))}
                    >
                        Expand All
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedNodes(new Set())}
                    >
                        Collapse All
                    </Button>
                </div>

                <div className="relative flex-1 max-w-sm">
                    <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <DataTable<ICategory>
                data={categories}
                columns={columns}
                getRowId={(row) => row._id}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                onChangeData={() => { }} // Controlled by tree state
                pageSize={100}
            />
        </div>
    );
}

export default CategoriesDataTable;