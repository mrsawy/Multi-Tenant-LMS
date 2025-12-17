"use client"
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { usePathname, useRouter } from "@/i18n/navigation";
import { IContent } from "@/lib/types/course/content.interface";
import { CourseContentType } from "@/lib/types/course/enum/CourseContentType.enum";
import { Clock, FileText, HelpCircle, PenTool, Play } from "lucide-react";



interface ContentViewerProps {
    content: IContent;
    isCompleted: boolean;
}

export function ContentViewer({ content, isCompleted = false }: ContentViewerProps) {

    const router = useRouter()
    const pathName = usePathname()

    const getContentIcon = (type: CourseContentType) => {
        switch (type) {
            case CourseContentType.VIDEO:
                return <Play className="w-4 h-4" />;
            case CourseContentType.ARTICLE:
                return <FileText className="w-4 h-4" />;
            case CourseContentType.ASSIGNMENT:
                return <PenTool className="w-4 h-4" />;
            case CourseContentType.QUIZ:
                return <HelpCircle className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getContentTypeColor = (type: CourseContentType) => {
        switch (type) {
            case CourseContentType.VIDEO:
                return "bg-blue-500";
            case CourseContentType.ARTICLE:
                return "bg-green-500";
            case CourseContentType.ASSIGNMENT:
                return "bg-orange-500";
            case CourseContentType.QUIZ:
                return "bg-purple-500";
            default:
                return "bg-gray-500";
        }
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return null;
        return `${minutes} min`;
    };

    return (
        <Card className={`hover:shadow-md transition-shadow `}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getContentTypeColor(content.type)}`}>
                            {getContentIcon(content.type)}
                        </div>
                        <div>
                            <CardTitle className="text-base font-medium">
                                {content.title}
                            </CardTitle>
                            {content.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {content.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getContentTypeColor(content.type).replace('bg-', 'border-')}>
                            {content.type}
                        </Badge>
                        {isCompleted && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                ✓ Completed
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {content.quizDurationInMinutes && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDuration(content.quizDurationInMinutes)}</span>
                            </div>
                        )}
                        {content.maxPoints && (
                            <span>{content.maxPoints} points</span>
                        )}
                        {content.dueDate && (
                            <span>Due: {new Date(content.dueDate).toLocaleDateString()}</span>
                        )}
                    </div>

                    <Button
                        variant={isCompleted ? "outline" : "default"}
                        size="sm"
                        onClick={() => {
                            router.push(pathName + "/" + content._id)
                        }}
                    >
                        {isCompleted ? "Review" : "Start"}
                    </Button>
                </div>

                {content.type === CourseContentType.QUIZ && content.questions && (
                    <div className="mt-3 text-sm text-muted-foreground">
                        {content.questions.length} question{content.questions.length !== 1 ? 's' : ''}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}