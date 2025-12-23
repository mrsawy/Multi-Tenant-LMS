'use client';

import React, { useState } from 'react';
import { ICourse } from '@/lib/types/course/course.interface';
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
import { CalendarIcon, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import { toast } from 'react-toastify';
import { generateAttendanceReport } from '@/lib/actions/attendance/generateReport.action';
import { Badge } from '@/components/atoms/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/atoms/card';
import { Progress } from '@/components/atoms/progress';

interface AttendanceReportProps {
  courses: ICourse[];
}

interface ReportData {
  summary: {
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalExcused: number;
    totalRecords: number;
    totalStudents: number;
  };
  students: {
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    totalClasses: number;
    attendanceRate: number;
  }[];
}

export function AttendanceReport({ courses }: AttendanceReportProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const handleGenerateReport = async () => {
    if (!selectedCourseId) {
      toast.error('Please select a course');
      return;
    }

    setLoading(true);
    try {
      const data = await generateAttendanceReport({
        courseId: selectedCourseId,
        startDate,
        endDate,
      }) as ReportData;
      console.log({ data });
      setReportData(data);
      toast.success('Report generated successfully');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Attendance Report</CardTitle>
          <CardDescription>
            Generate attendance reports for your courses over a specific date range
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Select Course</label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a course...' />
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

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Start Date (Optional)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>End Date (Optional)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0'>
                  <Calendar mode='single' selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button onClick={handleGenerateReport} disabled={loading || !selectedCourseId}>
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>{selectedCourse?.name} - Attendance Report</CardTitle>
                <CardDescription>
                  {startDate && endDate
                    ? `${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`
                    : 'All Time'}
                </CardDescription>
              </div>
              <Button variant='outline' size='sm'>
                <Download className='mr-2 h-4 w-4' />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reportData.students && reportData.students.length > 0 && (
              <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-6'>
                <Card>
                  <CardContent className='pt-6'>
                    <div className='text-2xl font-bold'>{reportData.summary.totalStudents}</div>
                    <p className='text-xs text-muted-foreground'>Total Students</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='pt-6'>
                    <div className='text-2xl font-bold text-green-600'>
                      {reportData.summary.totalPresent}
                    </div>
                    <p className='text-xs text-muted-foreground'>Present</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='pt-6'>
                    <div className='text-2xl font-bold text-red-600'>
                      {reportData.summary.totalAbsent}
                    </div>
                    <p className='text-xs text-muted-foreground'>Absent</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='pt-6'>
                    <div className='text-2xl font-bold text-yellow-600'>
                      {reportData.summary.totalLate}
                    </div>
                    <p className='text-xs text-muted-foreground'>Late</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className='pt-6'>
                    <div className='text-2xl font-bold text-blue-600'>
                      {reportData.summary.totalExcused}
                    </div>
                    <p className='text-xs text-muted-foreground'>Excused</p>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className='border rounded-md'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Total Classes</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Excused</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!reportData.students || reportData.students.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={8} className='text-center py-8 text-muted-foreground'>
                        No attendance data found.
                      </TableCell>
                    </TableRow>
                  )}
                  {reportData.students?.map((student) => (
                    <TableRow key={student.studentId}>
                      <TableCell className='font-medium'>
                        <div className='flex items-center gap-2'>
                          {student.avatar && (
                            <img
                              src={student.avatar}
                              alt={`${student.firstName} ${student.lastName}`}
                              className='w-8 h-8 rounded-full object-cover'
                            />
                          )}
                          <span>
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>{student.email}</TableCell>
                      <TableCell>
                        <Badge variant='outline'>{student.totalClasses}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant='default'>{student.presentCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant='destructive'>{student.absentCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>{student.lateCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{student.excusedCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Progress
                            value={student.attendanceRate || 0}
                            className={cn(
                              'w-24',
                              student.attendanceRate >= 75
                                ? '[&>*]:bg-green-600'
                                : student.attendanceRate >= 50
                                  ? '[&>*]:bg-yellow-600'
                                  : '[&>*]:bg-red-600'
                            )}
                          />
                          <span className='text-sm font-medium min-w-[45px]'>
                            {student.attendanceRate?.toFixed(1) || 0}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

