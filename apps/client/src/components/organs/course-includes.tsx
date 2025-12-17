import { Separator } from '@/components/atoms/separator';
import { CheckCircle } from 'lucide-react';
import React from 'react';

interface CourseIncludesProps {
    learningObjectives: string[];
}

export const CourseIncludes = React.memo<CourseIncludesProps>(({ learningObjectives }) => {
    return (
        <>
            <Separator />
            <div className="space-y-3">
                <h4 className="font-medium">This course includes:</h4>
                <div className="space-y-2">
                    {learningObjectives.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span>{feature}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
});

CourseIncludes.displayName = 'CourseIncludes';
export default CourseIncludes;