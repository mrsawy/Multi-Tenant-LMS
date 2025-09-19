"use client";

import { Link } from '@/i18n/navigation';
import { useModuleCount } from '@/lib/hooks/course/useModules';


interface ModulesCountCellProps {
  courseId: string;
}

export function ModulesCountCell({ courseId }: ModulesCountCellProps) {
  const moduleCount = useModuleCount(courseId);

  return (
    <Link
      href={`/organization-dashboard/courses/${courseId}/modules`}
      className='underline underline-offset-2 text-blue-800 dark:text-blue-400'
    >
      {moduleCount} modules
    </Link>
  );
}
