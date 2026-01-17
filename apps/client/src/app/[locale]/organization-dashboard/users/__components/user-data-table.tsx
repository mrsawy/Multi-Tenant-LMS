"use client"

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { DataTable } from "@/components/molecules/data-table";
import { ColumnDef } from "@tanstack/react-table"
import { IUser } from '@/lib/types/user/user.interface';

import { Button } from '@/components/atoms/button';
import { IconDotsVertical, IconGripVertical, IconSearch } from '@tabler/icons-react';
import { Checkbox } from '@/components/atoms/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/atoms/dialog"
import { Input } from '@/components/atoms/input';
import { Plus, PlusIcon, X, Eye, Edit, Mail, Phone, Shield, User, Crown, GraduationCap, Users } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/atoms/dropdown-menu'
import { SortableRowHandleContext } from '@/components/molecules/data-table';


import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar';
import { Badge } from '@/components/atoms/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/select';
import { UserStatus } from '@/lib/schema/user.schema';
import { useDeleteUser, useDeleteUsers, useUpdateUserStatus, useUsersByOrganization } from '@/lib/hooks/user/use-user.hook';
import { getFileFullUrl } from '@/lib/utils/getFileFullUrl';

// User role icon mapping
const getRoleIcon = (role: string) => {
    const roleType = role?.toLowerCase();
    if (roleType?.includes('admin')) return <Shield className="h-4 w-4 text-red-500" />;
    if (roleType?.includes('instructor') || roleType?.includes('teacher')) return <GraduationCap className="h-4 w-4 text-blue-500" />;
    if (roleType?.includes('student')) return <User className="h-4 w-4 text-green-500" />;
    if (roleType?.includes('manager')) return <Crown className="h-4 w-4 text-purple-500" />;
    return <Users className="h-4 w-4 text-gray-400" />;
};

// Status color mapping
const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'active':
            return "bg-green-50 text-green-700 border-green-200";
        case 'inactive':
            return "bg-gray-50 text-gray-700 border-gray-200";
        case 'suspended':
            return "bg-red-50 text-red-700 border-red-200";
        case 'pending':
            return "bg-yellow-50 text-yellow-700 border-yellow-200";
        default:
            return "bg-gray-50 text-gray-700 border-gray-200";
    }
};


function UserDataTable() {
    const [openRowId, setOpenRowId] = useState<string | null>(null);
    const [tempStatus, setTempStatus] = useState<string>('');
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // Use custom hooks for user management with pagination
    const { data: users = { docs: [], totalPages: 0 }, isLoading, error } = useUsersByOrganization({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
    })
    const deleteUsersMutation = useDeleteUsers();
    const deleteUserMutation = useDeleteUser();
    const updateUserStatusMutation = useUpdateUserStatus();

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
        deleteUsersMutation.mutate(ids);
    }, [deleteUsersMutation]);


    const handleDeleteUser = useCallback((userId: string) => {
        deleteUserMutation.mutate(userId);
    }, [deleteUserMutation]);

    // Handle opening the dialog and initializing temp status
    const handleOpenStatusDialog = useCallback((userId: string) => {
        const user = users.docs.find(u => u._id === userId);
        if (user) {
            setTempStatus(user.status || UserStatus.ACTIVE);
            setOpenRowId(userId);
        }
    }, [users]);

    // Handle closing dialog and resetting temp state
    const handleCloseDialog = useCallback(() => {
        setOpenRowId(null);
        setTempStatus('');
    }, []);

    // Handle saving status changes
    const handleSaveStatus = useCallback((userId: string) => {
        updateUserStatusMutation.mutate({
            userId,
            status: tempStatus
        });
        handleCloseDialog();
    }, [tempStatus, handleCloseDialog, updateUserStatusMutation]);

    // Get user's initials for avatar fallback
    const getUserInitials = useCallback((firstName: string, lastName: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    }, []);

    // Format last login date
    const formatLastLogin = useCallback((date: Date | null) => {
        if (!date) return 'Never';
        const now = new Date();
        const diffMs = now.getTime() - new Date(date).getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return new Date(date).toLocaleDateString();
    }, []);

    // Memoize columns to prevent re-renders
    const columns: ColumnDef<IUser>[] = useMemo(() => [

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
                        className='border-primary'
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center my-3">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className='border-primary'

                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "user",
            header: "User",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={getFileFullUrl(user.profile?.avatar)} alt={`${user.firstName} ${user.lastName}`} />
                            <AvatarFallback>
                                {getUserInitials(user.firstName as string, user.lastName as string)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                        </div>
                    </div>
                );
            },
            enableHiding: false,
        },
        {
            accessorKey: "email",
            header: "Contact",
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{row.original.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{row.original.phone}</span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {getRoleIcon(row.original.roleName)}
                    <span className="capitalize">{row.original.roleName}</span>
                </div>
            )
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(row.original.status as string)}>
                        {row.original.status}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenStatusDialog(row.original._id as string)}
                        className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                    >
                        Change
                    </Button>
                </div>
            )
        },
        {
            accessorKey: "lastLogin",
            header: "Last Login",
            cell: ({ row }) => {
                return (
                    <span className="text-sm text-muted-foreground">
                        {formatLastLogin(row.original.lastLogin as Date | null)}
                    </span>
                );
            }
        },
        {
            accessorKey: "createdAt",
            header: "Joined",
            cell: ({ row }) => {
                const date = new Date(row.original.createdAt as any);
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
                    <DropdownMenuContent align="end" className=" w-full cursor-pointer">
                        <Link
                            href={`/organization-dashboard/users/${row.original._id}/edit`}
                            className="flex items-center cursor-pointer  w-full"
                        >
                            <DropdownMenuItem className='w-full cursor-pointer'>
                                <Edit className="mr-2 size-4 " />
                                Edit
                            </DropdownMenuItem>
                        </Link>
                        {/* <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        {/* <DropdownMenuItem
                            onClick={() => handleOpenStatusDialog(row.original._id as any)}
                        >
                            <Shield className="mr-2 h-4 w-4" />
                            Change Status
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDeleteUser(row.original._id as any)}
                            className='cursor-pointer'
                        >
                            Delete User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ], [handleOpenStatusDialog, handleDeleteUser, getUserInitials, formatLastLogin]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center p-5">
                    <h2 className="text-xl font-medium">Users</h2>
                </div>
                <div className="flex items-center justify-center p-8">
                    <div className="text-muted-foreground">Loading users...</div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center p-5">
                    <h2 className="text-xl font-medium">Users</h2>
                </div>
                <div className="flex items-center justify-center p-8">
                    <div className="text-red-500">Error loading users: {error.message}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-24">
            {/* Header */}
            <div className="flex justify-between items-center p-5">
                <div>
                    <h2 className="text-xl font-medium">Users</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage users in your organization ({users.docs.length} total)
                    </p>
                </div>
                <Link href="/organization-dashboard/users/create" className='cursor-pointer'>
                    <Button variant="default">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-2 p-5">
                <div className="relative flex-1 max-w-sm ms-auto">
                    <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Students</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {users.docs.filter(u => u.roleName.toLowerCase().includes('student')).length}
                                </p>
                            </div>
                            <User className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DataTable<IUser>
                data={users.docs}
                columns={columns}
                // onReorder={users}
                getRowId={(row) => row._id as any}
                onDeleteSelected={deleteSelected}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                onChangeData={() => { }}
                pageSize={pagination.pageSize}
                manualPagination={true}
                pageCount={users.totalPages}
                pagination={pagination}
                onPaginationChange={setPagination}
            />

            {/* Status Change Dialog */}
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
                        <DialogTitle>Change User Status</DialogTitle>
                        <DialogDescription>
                            Update the user's status in the system
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={tempStatus}
                                onValueChange={setTempStatus}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={UserStatus.ACTIVE}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            Active
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={UserStatus.INACTIVE}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                            Inactive
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={UserStatus.SUSPENDED}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            Suspended
                                        </div>
                                    </SelectItem>
                                    <SelectItem value={UserStatus.PENDING}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                            Pending
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {tempStatus === UserStatus.SUSPENDED && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-800">
                                    <strong>Warning:</strong> Suspending this user will prevent them from accessing the system.
                                </p>
                            </div>
                        )}

                        {tempStatus === UserStatus.INACTIVE && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Inactive users can still access the system but with limited functionality.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            onClick={() => openRowId && handleSaveStatus(openRowId)}
                        >
                            Update Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default UserDataTable;

{/* <CardContent className="p-4">
    <div className="flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{userData.length}</p>
        </div>
        <Users className="h-8 w-8 text-blue-500" />
    </div>
</CardContent>
                </Card >
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {userData.filter(u => u.status === 'active').length}
                                </p>
                            </div>
                            <Shield className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Instructors</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {userData.filter(u => u.role.toLowerCase().includes('instructor')).length}
                                </p>
                            </div>
                            <GraduationCap className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card></Card> */}