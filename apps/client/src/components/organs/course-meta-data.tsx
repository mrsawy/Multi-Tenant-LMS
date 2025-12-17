import { Separator } from '@/components/atoms/separator';
import React from 'react';

interface CourseMetadataProps {
    language?: string;
    updatedAt: string;
}

export const CourseMetadata = React.memo<CourseMetadataProps>(({ language, updatedAt }) => {
    return (
        <>
            <Separator />
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Language:</span>
                    <span>{language}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Last updated:</span>
                    <span>{updatedAt}</span>
                </div>
            </div>
        </>
    );
});

CourseMetadata.displayName = 'CourseMetadata';
export default CourseMetadata;