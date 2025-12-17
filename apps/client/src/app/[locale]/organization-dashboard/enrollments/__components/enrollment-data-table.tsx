"use client"

import React, { useState, useMemo, useCallback } from 'react'
import { DataTable } from "@/components/molecules/data-table";
import { IEnrollment, SubscriptionStatus } from '@/lib/types/enrollment/enrollment.interface';
import { ColumnDef } from "@tanstack/react-table"
import { Button } from '@/components/atoms/button';
import { IconDotsVertical, IconSearch } from '@tabler/icons-react';
import { Checkbox } from '@/components/atoms/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/atoms/dialog"
import { Input } from '@/components/atoms/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'
import { Badge } from '@/components/atoms/badge';
import { getFileFullUrl } from '@/lib/utils/getFileFullUrl';
import { Progress } from '@/components/atoms/progress';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar';
import AddEnrollmentDialog from './add-enrollment-dialog';
import { enrollmentKeys, useEnrollmentsByOrganization } from '@/lib/hooks/enrollment/enrollments.hook';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import useGeneralStore from '@/lib/store/generalStore';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

function EnrollmentDataTable() {

    const { data: enrollments } = useEnrollmentsByOrganization()



    const [enrollmentList, setEnrollmentList] = React.useState<IEnrollment[]>(enrollments?.docs || [])
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [progressDialogOpen, setProgressDialogOpen] = useState<boolean>(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<IEnrollment | null>(null);
    const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState<boolean>(false);

    React.useEffect(() => {
        setEnrollmentList(enrollments?.docs || [])
        console.log({ enrollments })
    }, [enrollments])

    const deleteSelected = useCallback((ids: string[]) => {
        // Handle deletion logic here
    }, []);

    const handleOpenProgressDialog = useCallback((enrollment: IEnrollment) => {
        setSelectedEnrollment(enrollment);
        setProgressDialogOpen(true);
    }, []);

    const handleCloseProgressDialog = useCallback(() => {
        setProgressDialogOpen(false);
        setSelectedEnrollment(null);
    }, []);

    const handleOpenSubscriptionDialog = useCallback((enrollment: IEnrollment) => {
        setSelectedEnrollment(enrollment);
        setSubscriptionDialogOpen(true);
    }, []);

    const handleCloseSubscriptionDialog = useCallback(() => {
        setSubscriptionDialogOpen(false);
        setSelectedEnrollment(null);
    }, []);

    const getStatusBadgeVariant = (status: SubscriptionStatus) => {
        switch (status) {
            case SubscriptionStatus.ACTIVE:
                return "default";
            case SubscriptionStatus.EXPIRED:
                return "secondary";
            case SubscriptionStatus.CANCELLED:
            case SubscriptionStatus.SUSPENDED:
                return "destructive";
            default:
                return "outline";
        }
    };

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const queryClient = useQueryClient()
    const toggleStatus = async (id: string, status: SubscriptionStatus) => {
        try {
            useGeneralStore.setState({ generalIsLoading: true })

            const response = await createAuthorizedNatsRequest("enrollment.updateByOrg", { enrollmentId: id, enrollmentData: { subscription: { status } } })
            console.log({ response })
            queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
            toast.success("Status updated successfully")
        } catch (error: any) {
            console.log(error)
            toast.error(error?.message || "Error updating the status")
        } finally {
            useGeneralStore.setState({ generalIsLoading: false })
        }
    }

    const columns: ColumnDef<IEnrollment>[] = useMemo(() => [
        {
            accessorKey: "course",
            header: "Course",
            cell: ({ row }) => {
                const course = row.original.course;
                return (
                    <div className="flex items-center gap-3 me-16">
                        {course?.thumbnailKey && (
                            <img
                                src={getFileFullUrl(course.thumbnailKey)}
                                alt={course.name}
                                className="w-10 h-10 rounded object-cover"
                            />
                        )}
                        <div>
                            <h3 className="font-medium">{course?.name || 'Unknown Course'}</h3>
                            <p className="text-sm opacity-70">{course?.shortDescription}</p>
                        </div>
                    </div>
                )
            },
            enableHiding: false,
        },
        {
            accessorKey: "User",
            accessorFn: (row) => `${row?.user?.firstName} ${row?.user?.lastName} ${row?.user?.email}`,

            header: "Student ",
            cell: ({ row }) => {
                return <div className='flex gap-2 justify-start items-center'>
                    <Avatar>
                        <AvatarImage src={getFileFullUrl(row.original.user?.profile?.avatar)} />
                        <AvatarFallback>{row.original.user?.firstName.slice(0, 1)}{row.original.user?.lastName.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col gap-1'>
                        <span>{row.original.user?.firstName}{" "}{row.original.user?.lastName}</span>
                        <span className='text-accent'>{row.original.user?.email}</span>
                    </div>
                </div>
            }
        },
        {
            accessorKey: "enrolledAt",
            header: "Enrolled At",
            cell: ({ row }) => {
                return <span>{formatDate(row.original.enrolledAt)}</span>
            }
        },
        {
            accessorKey: "accessType",
            header: "Access Type",
            cell: ({ row }) => {
                return (
                    <Badge variant="outline">
                        {row.original.accessType}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "progressPercentage",
            header: "Progress",
            cell: ({ row }) => {
                const progress = row.original.progressPercentage;
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenProgressDialog(row.original)}
                        className="text-left justify-start h-auto p-2 w-full"
                    >
                        <div className="w-full space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    </Button>
                )
            }
        },
        {
            accessorKey: "subscription",
            header: "Subscription",
            cell: ({ row }) => {
                const subscription = row.original.subscription;
                if (!subscription) {
                    return <span className="opacity-70">No subscription</span>
                }
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenSubscriptionDialog(row.original)}
                        className="text-left justify-start h-auto p-2"
                    >
                        <Badge variant={getStatusBadgeVariant(subscription.status)}>
                            {subscription.status}
                        </Badge>
                    </Button>
                )
            }
        },
        {
            accessorKey: "certificate",
            header: "Certificate",
            cell: ({ row }) => {
                const certificate = row.original.certificate;
                return (
                    <Badge variant={certificate.issued ? "default" : "secondary"}>
                        {certificate.issued ? "Issued" : "Not Issued"}
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
                            className="data-[state=open]:bg-muted flex size-8"
                            size="icon"
                        >
                            <IconDotsVertical />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        {/* <DropdownMenuSeparator /> */}
                        <DropdownMenuItem className='cursor-pointer' variant="destructive"
                            onClick={() => toggleStatus(row.original._id as string, row.original.subscription?.status === SubscriptionStatus.ACTIVE ? SubscriptionStatus.CANCELLED : SubscriptionStatus.ACTIVE)}>
                            {row.original.subscription?.status === SubscriptionStatus.ACTIVE ? "Deactivate Access" : "Activate Access"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu >
            ),
        },
    ], [handleOpenProgressDialog, handleOpenSubscriptionDialog]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center p-5">
                <h2 className="text-xl font-medium">Enrollments</h2>
                <div className="flex gap-2 cursor-pointer">
                    <AddEnrollmentDialog />
                </div>
            </div>

            <div className="flex items-center space-x-2 p-5">
                <div className="relative flex-1 max-w-sm ms-auto">
                    <IconSearch className="absolute left-2 top-2.5 h-4 w-4 opacity-50" />
                    <Input
                        placeholder="Search enrollments..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <DataTable<IEnrollment>
                data={enrollmentList}
                columns={columns}
                getRowId={(row) => row._id?.toString() || ''}
                onDeleteSelected={deleteSelected}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                onChangeData={setEnrollmentList}
            />

            {/* Progress Details Dialog */}
            <Dialog
                open={progressDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCloseProgressDialog();
                    }
                }}
            >
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Progress Details</DialogTitle>
                        <DialogDescription>
                            Student progress for {selectedEnrollment?.course?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEnrollment && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-medium">Overall Progress</span>
                                    <span className="font-semibold">{selectedEnrollment.progressPercentage}%</span>
                                </div>
                                <Progress value={selectedEnrollment.progressPercentage} className="h-3" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4">
                                    <label className="text-sm font-medium opacity-70">
                                        Completed Modules
                                    </label>
                                    <p className="text-2xl font-semibold">
                                        {selectedEnrollment.progress.completedModules.length}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <label className="text-sm font-medium opacity-70">
                                        Completed Contents
                                    </label>
                                    <p className="text-2xl font-semibold">
                                        {selectedEnrollment.progress.completedContents.length}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <label className="text-sm font-medium opacity-70">
                                        Time Spent
                                    </label>
                                    <p className="text-2xl font-semibold">
                                        {formatTime(selectedEnrollment.timeSpentMinutes)}
                                    </p>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <label className="text-sm font-medium opacity-70">
                                        Last Accessed
                                    </label>
                                    <p className="text-lg font-semibold">
                                        {formatDate(selectedEnrollment.lastAccessedAt)}
                                    </p>
                                </div>
                            </div>

                            {Array.isArray(selectedEnrollment.progress.quizScores) && selectedEnrollment.progress.quizScores.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-medium">Quiz Scores</h3>
                                    <div className="space-y-2">
                                        {selectedEnrollment.progress.quizScores.map((quiz, index) => (
                                            <div key={quiz.quizId} className="border rounded-lg p-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm">Quiz {index + 1}</span>
                                                    <div className="flex gap-4 text-sm">
                                                        <span>Score: <span className="font-semibold">{quiz.score}%</span></span>
                                                        <span>Attempts: <span className="font-semibold">{quiz.attempts}</span></span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleCloseProgressDialog}>
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Subscription Details Dialog */}
            <Dialog
                open={subscriptionDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCloseSubscriptionDialog();
                    }
                }}
            >
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Subscription Details</DialogTitle>
                        <DialogDescription>
                            Subscription information for this enrollment
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEnrollment?.subscription && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <span className="font-medium">Status</span>
                                <Badge variant={getStatusBadgeVariant(selectedEnrollment.subscription.status)}>
                                    {selectedEnrollment.subscription.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4">
                                    <label className="text-sm font-medium opacity-70">
                                        Start Date
                                    </label>
                                    <p className="text-lg font-semibold">
                                        {formatDate(selectedEnrollment.subscription.starts_at)}
                                    </p>
                                </div>

                                {selectedEnrollment.subscription.ends_at && (
                                    <div className="border rounded-lg p-4">
                                        <label className="text-sm font-medium opacity-70">
                                            End Date
                                        </label>
                                        <p className="text-lg font-semibold">
                                            {formatDate(selectedEnrollment.subscription.ends_at)}
                                        </p>
                                    </div>
                                )}

                                {selectedEnrollment.subscription.next_billing && (
                                    <div className="border rounded-lg p-4">
                                        <label className="text-sm font-medium opacity-70">
                                            Next Billing
                                        </label>
                                        <p className="text-lg font-semibold">
                                            {formatDate(selectedEnrollment.subscription.next_billing)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="border rounded-lg p-4 space-y-3">
                                <h3 className="font-medium">Billing Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <label className="opacity-70">Name</label>
                                        <p className="font-medium">
                                            {selectedEnrollment.subscription.billing.first_name}{' '}
                                            {selectedEnrollment.subscription.billing.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="opacity-70">Email</label>
                                        <p className="font-medium">{selectedEnrollment.subscription.billing.email}</p>
                                    </div>
                                    <div>
                                        <label className="opacity-70">Amount</label>
                                        <p className="font-medium">
                                            {selectedEnrollment.subscription.billing.amount}{' '}
                                            {selectedEnrollment.subscription.billing.currency}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="opacity-70">Billing Cycle</label>
                                        <p className="font-medium capitalize">
                                            {selectedEnrollment.subscription.billing.billingCycle}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleCloseSubscriptionDialog}>
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default EnrollmentDataTable