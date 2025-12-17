import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { ICourseOverview, ICourseWithModules } from '@/lib/types/course/course.interface';
import { CourseContentType } from '@/lib/types/course/enum/CourseContentType.enum';
import { BookOpen, ClipboardList, FileText, Play, Video } from 'lucide-react';

import React from 'react';

const CourseContent: React.FC<{ course: ICourseOverview }> = ({ course }) => {
    const totalContents = course.modules.reduce((acc, module) => acc + module.contentsIds.length, 0);
    const getContentIcon = (type: CourseContentType) => {
        switch (type) {
            case CourseContentType.VIDEO:
                return <Video className="h-4 w-4 text-muted-foreground" />;
            case CourseContentType.ARTICLE:
                return <FileText className="h-4 w-4 text-muted-foreground" />;
            case CourseContentType.QUIZ:
                return <ClipboardList className="h-4 w-4 text-muted-foreground" />;
            case CourseContentType.ASSIGNMENT:
                return <BookOpen className="h-4 w-4 text-muted-foreground" />;
            default:
                return <Play className="h-4 w-4 text-muted-foreground" />;
        }
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {course.modules.length} modules • {totalContents} lessons • {course?.duration || ""} total length
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {course.modules.map((module, index) => (
                    <div key={module._id} className="border border-border rounded-lg">
                        <div className="p-4 bg-muted/30">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h4 className="font-medium mb-2">{module.title}</h4>
                                    {module.description && (
                                        <p className="text-sm text-muted-foreground">{module.description}</p>
                                    )}
                                    {module.learningObjectives && module.learningObjectives.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Learning Objectives:</p>
                                            <ul className="text-xs text-muted-foreground space-y-1">
                                                {module.learningObjectives.map((objective, idx) => (
                                                    <li key={idx} className="flex items-start gap-1">
                                                        <span className="mt-1">•</span>
                                                        <span>{objective}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground whitespace-nowrap">
                                    {Array.isArray(module.contents) && module.contents.length} lessons
                                </div>
                            </div>
                        </div>
                        <div className="p-4 pt-2 space-y-2">
                            {Array.isArray(module.contents) && module.contents.map((content, contentIndex) => (
                                <div key={content._id} className="flex items-center gap-2 text-sm py-1 hover:bg-muted/50 rounded px-2 -mx-2 transition-colors">
                                    {getContentIcon(content.type)}
                                    <span className="flex-1">{content.title}</span>
                                    {content.description && (
                                        <span className="text-xs text-muted-foreground">
                                            {content.type}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default CourseContent;