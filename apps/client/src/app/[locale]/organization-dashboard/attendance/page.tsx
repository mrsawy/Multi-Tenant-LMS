import React from 'react';
import { getCourses } from '@/lib/actions/courses/getCourses.action';
import { AttendanceDashboard } from './_components/AttendanceDashboard';
import { AttendanceReport } from './_components/AttendanceReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs';

export default async function AttendancePage() {
  const coursesRes: any = await getCourses();
  const courses = coursesRes?.docs || [];

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Attendance Management</h1>
        <p className='text-muted-foreground'>Manage and track attendance for your courses.</p>
      </div>

      <Tabs defaultValue='mark' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 max-w-md'>
          <TabsTrigger value='mark'>Mark Attendance</TabsTrigger>
          <TabsTrigger value='report'>View Reports</TabsTrigger>
        </TabsList>
        <TabsContent value='mark' className='mt-6'>
          <AttendanceDashboard courses={courses} />
        </TabsContent>
        <TabsContent value='report' className='mt-6'>
          <AttendanceReport courses={courses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
