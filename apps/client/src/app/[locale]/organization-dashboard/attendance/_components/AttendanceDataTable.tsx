'use client';

import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/molecules/data-table';
import { Input } from '@/components/atoms/input';
import { Button } from '@/components/atoms/button';
import { AttendanceStatus } from '@/lib/types/attendance/attendance.types';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface StudentAttendanceRow {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  status: AttendanceStatus | null;
  notes?: string;
  attendanceId?: string;
}

interface AttendanceDataTableProps {
  students: StudentAttendanceRow[];
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onNotesChange: (studentId: string, notes: string) => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  loadMoreRef?: React.RefObject<HTMLDivElement | null>;
}

export function AttendanceDataTable({
  students,
  onStatusChange,
  onNotesChange,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  loadMoreRef,
}: AttendanceDataTableProps) {
  
  const columns: ColumnDef<StudentAttendanceRow>[] = useMemo(
    () => [
      {
        accessorKey: 'firstName',
        header: 'Student',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-3'>
              {row.original.avatar && (
                <img
                  src={row.original.avatar}
                  alt={`${row.original.firstName} ${row.original.lastName}`}
                  className='w-8 h-8 rounded-full object-cover'
                />
              )}
              <div>
                <div className='font-medium'>
                  {row.original.firstName} {row.original.lastName}
                </div>
              </div>
            </div>
          );
        },
        enableHiding: false,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => {
          return <span className='text-sm text-muted-foreground'>{row.original.email}</span>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const student = row.original;
          return (
            <div>
              <div className='flex gap-1'>
                {[
                  AttendanceStatus.PRESENT,
                  AttendanceStatus.ABSENT,
                  AttendanceStatus.LATE,
                  AttendanceStatus.EXCUSED,
                ].map((status) => (
                  <Button
                    key={status}
                    variant={
                      student.status === status
                        ? status === AttendanceStatus.PRESENT
                          ? 'default'
                          : status === AttendanceStatus.ABSENT
                            ? 'destructive'
                            : 'secondary'
                        : 'outline'
                    }
                    size='sm'
                    className={cn(
                      'h-7 px-2',
                      student.status === status && 'ring-1 ring-offset-1'
                    )}
                    onClick={() => onStatusChange(student.studentId, status)}
                  >
                    {status.charAt(0)}
                  </Button>
                ))}
              </div>
              <div className='text-xs text-muted-foreground mt-1'>
                {student.status || 'Not Marked'}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ row }) => {
          const student = row.original;
          return (
            <Input
              className='h-8 text-xs'
              placeholder='Add note...'
              value={student.notes || ''}
              onChange={(e) => onNotesChange(student.studentId, e.target.value)}
            />
          );
        },
      },
    ],
    [onStatusChange, onNotesChange]
  );

  if (isLoading && students.length === 0) {
    return (
      <div className='flex justify-center p-12'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='max-h-[600px] overflow-auto'>
        <DataTable<StudentAttendanceRow>
          data={students}
          columns={columns}
          getRowId={(row) => row.studentId}
        />
      </div>

      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className='flex justify-center py-4'>
          {isFetchingNextPage && <Loader2 className='h-6 w-6 animate-spin' />}
        </div>
      )}

      {!hasNextPage && students.length > 0 && (
        <p className='text-center text-sm text-muted-foreground py-4'>
          All students loaded ({students.length} total)
        </p>
      )}

      {students.length === 0 && !isLoading && (
        <div className='text-center py-8 text-muted-foreground'>
          No students found.
        </div>
      )}
    </div>
  );
}

