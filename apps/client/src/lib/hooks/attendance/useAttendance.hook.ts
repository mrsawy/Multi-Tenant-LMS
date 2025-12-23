import { useState, useCallback } from 'react';
import { 
  getAttendanceByDate, 
  getStudentAttendance 
} from '@/lib/actions/attendance/getAttendance.action';
import { markAttendance } from '@/lib/actions/attendance/markAttendance.action';
import { 
  Attendance, 
  MarkAttendanceInput, 
  GetAttendanceByDateInput,
  GetStudentAttendanceInput
} from '@/lib/types/attendance/attendance.types';

export function useAttendance() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceByDate = useCallback(async (input: GetAttendanceByDateInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAttendanceByDate(input);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentAttendance = useCallback(async (input: GetStudentAttendanceInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentAttendance(input);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAttendance = useCallback(async (input: MarkAttendanceInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await markAttendance(input);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchAttendanceByDate,
    fetchStudentAttendance,
    submitAttendance,
  };
}
