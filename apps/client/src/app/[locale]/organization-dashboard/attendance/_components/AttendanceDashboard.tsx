'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ICourse } from '@/lib/types/course/course.interface';
import { getCourseEnrollments } from '@/lib/actions/enrollment/getCourseEnrollments.action';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select';
import { Button } from '@/components/atoms/button';
import { Calendar } from '@/components/atoms/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/atoms/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceStatus } from '@/lib/types/attendance/attendance.types';
import { toast } from 'react-toastify';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttendanceByDate } from '@/lib/actions/attendance/getAttendance.action';
import { bulkMarkAttendance } from '@/lib/actions/attendance/bulkMarkAttendance.action';
import { AttendanceDataTable, StudentAttendanceRow } from './AttendanceDataTable';

interface AttendanceDashboardProps {
  courses: ICourse[];
}

export function AttendanceDashboard({ courses }: AttendanceDashboardProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [students, setStudents] = useState<StudentAttendanceRow[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch enrollments with infinite scrolling
  const {
    data: enrollmentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: enrollmentsLoading,
  } = useInfiniteQuery({
    queryKey: ['courseEnrollments', selectedCourseId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!selectedCourseId) return { docs: [], totalPages: 0, page: 1 };
      const result: any = await getCourseEnrollments(selectedCourseId, {
        limit: 20,
        page: pageParam,
      });
      return result;
    },
    getNextPageParam: (lastPage: any) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!selectedCourseId,
    initialPageParam: 1,
  });

  // Fetch attendance data
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', selectedCourseId, date.toISOString()],
    queryFn: async () => {
      if (!selectedCourseId) return [];
      return await getAttendanceByDate({
        courseId: selectedCourseId,
        date: date.toISOString(),
      });
    },
    enabled: !!selectedCourseId,
  });

  // Bulk save mutation
  const bulkSaveMutation = useMutation({
    mutationFn: bulkMarkAttendance,
    onSuccess: () => {
      toast.success('All attendance records saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedCourseId, date.toISOString()] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save attendance records');
    },
  });

  // Merge enrollment and attendance data
  useEffect(() => {
    if (enrollmentsData && attendanceData) {
      const allEnrollments = enrollmentsData.pages.flatMap((page) => page.docs);
      const merged = allEnrollments.map((enrollment: any) => {
        const existing = (attendanceData as any[]).find(
          (a: any) =>
            (typeof a.studentId === 'string' ? a.studentId : a.studentId._id) ===
            enrollment.user._id
        );
        return {
          studentId: enrollment.user._id,
          firstName: enrollment.user.firstName,
          lastName: enrollment.user.lastName,
          email: enrollment.user.email,
          avatar: enrollment.user.avatar,
          status: existing ? existing.status : null,
          notes: existing ? existing.notes : '',
          attendanceId: existing ? existing._id : undefined,
        };
      });
      setStudents(merged);
    }
  }, [enrollmentsData, attendanceData]);

  // Intersection observer for infinite scrolling
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => (s.studentId === studentId ? { ...s, status } : s)));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setStudents((prev) => prev.map((s) => (s.studentId === studentId ? { ...s, notes } : s)));
  };

  const markAll = (status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
    toast.info(`Marked all students as ${status}`);
  };

  const saveAll = async () => {
    if (!selectedCourseId) {
      toast.error('Please select a course');
      return;
    }

    const recordsToSave = students.filter((s) => s.status);

    if (recordsToSave.length === 0) {
      toast.warning('No attendance records to save');
      return;
    }

    try {
      const data = {
        courseId: selectedCourseId,
        date: date,
        attendanceRecords: recordsToSave.map((s) => ({
          studentId: s.studentId,
          status: s.status!,
          notes: s.notes,
        })),
      }
      console.log({ data });
      await bulkSaveMutation.mutateAsync(data);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="space-y-2 w-[300px]">
          <label className="text-sm font-medium">Select Course</label>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course..." />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex-1">
          <label className="text-sm font-medium">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal block",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 inline" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {selectedCourseId && (
        <div className='border rounded-md p-4 bg-background'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold'>
              Attendance for {format(date, 'MMMM do, yyyy')}
            </h2>
            <div className='space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => markAll(AttendanceStatus.PRESENT)}
                disabled={bulkSaveMutation.isPending}
              >
                Mark All Present
              </Button>
              <Button
                onClick={saveAll}
                disabled={bulkSaveMutation.isPending}
                effect="expandIcon"
                icon={bulkSaveMutation.isPending ? Loader2 : Save}
                iconPlacement="right"
              >
                Save All Changes
              </Button>
            </div>
          </div>

          <AttendanceDataTable
            students={students}
            onStatusChange={handleStatusChange}
            onNotesChange={handleNotesChange}
            isLoading={enrollmentsLoading || attendanceLoading}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            loadMoreRef={loadMoreRef}
          />
        </div>
      )}
    </div>
  );
}

