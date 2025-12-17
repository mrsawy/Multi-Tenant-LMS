"use client"
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Label } from "@/components/atoms/label";
import { Progress } from "@/components/atoms/progress";
import { RadioGroup, RadioGroupItem } from "@/components/atoms/radio-group";
import { Textarea } from "@/components/atoms/textarea";
import { useRouter } from "@/i18n/navigation";
import { IContent } from "@/lib/types/course/content.interface";
import { CourseContentType } from "@/lib/types/course/enum/CourseContentType.enum";
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Clock, FileText, HelpCircle, PenTool, Play } from "lucide-react";
import { useEffect, useState } from "react";
import VideoContent from "./video-content";
import ArticleContent from "./article-content";
import QuizContent from "./quiz-content";
import AssignmentContent from "./assignment-content";
import { IEnrollmentProgress } from "@/lib/types/enrollment/enrollment.interface";
import useGeneralStore from "@/lib/store/generalStore";
import { toggleContentComplete } from "@/lib/actions/courses/toggleContentComplete.action";

import { useParams } from 'next/navigation';
import { toast } from "react-toastify";


interface ContentViewProps {
    content: IContent;
    progress: IEnrollmentProgress
}

export default function ContentView({ content, progress }: ContentViewProps) {

    const [isComplete, setIsComplete] = useState<boolean>(progress.completedContents.includes(content._id))
    useEffect(() => {
        setIsComplete(progress.completedContents.includes(content._id))
    }, [progress])

    const params = useParams()
    const enrollmentId = params.id as string;
    const router = useRouter()

    const toggleComplete = async ({ completed, withToast = true, withRefresh = true }: { completed: boolean, withToast: boolean, withRefresh: boolean }) => {
        try {
            // useGeneralStore.setState({ generalIsLoading: true })
            const message = await toggleContentComplete({ enrollmentId, contentId: content._id, completed })
            withToast && toast.success(message)
            withRefresh && router.refresh()
        } catch (error: any) {
            toast.error(error.message ? error.message : "Some Thing Went Wrong")
        } finally {
            // useGeneralStore.setState({ generalIsLoading: false })
        }
    }

    const getContentIcon = (type: CourseContentType) => {
        switch (type) {
            case CourseContentType.VIDEO:
                return <Play className="w-6 h-6" />;
            case CourseContentType.ARTICLE:
                return <FileText className="w-6 h-6" />;
            case CourseContentType.ASSIGNMENT:
                return <PenTool className="w-6 h-6" />;
            case CourseContentType.QUIZ:
                return <HelpCircle className="w-6 h-6" />;
            default:
                return <FileText className="w-6 h-6" />;
        }
    };
    const renderContent = () => {

        switch (content.type) {
            case CourseContentType.VIDEO:
                return <VideoContent content={content} isComplete={isComplete} toggleComplete={toggleComplete} />;
            case CourseContentType.ARTICLE:
                return <ArticleContent content={content} isComplete={isComplete} toggleComplete={toggleComplete} />;
            case CourseContentType.QUIZ:
                return <QuizContent content={content} isComplete={isComplete} enrollmentId={enrollmentId} />;
            case CourseContentType.ASSIGNMENT:
                return <AssignmentContent content={content} />;
            default:
                return (
                    <div className="text-center py-12">
                        <FileText className="w-24 h-24 mx-auto mb-4" />
                        <p className="text-xl text-gray-600">Content not available</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => { router.back() }}
                        className="mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Course
                    </Button>

                    <div className="rounded-lg shadow-sm border p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                {getContentIcon(content.type)}
                            </div>
                            <div className="flex justify-between w-full">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {content.title}
                                    </h1>
                                    {content.description && (
                                        <p className="text-lg mb-3">
                                            {content.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-sm">
                                            {content.type}
                                        </Badge>
                                        {content.quizDurationInMinutes && (
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {content.quizDurationInMinutes} min
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    {isComplete && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                            ✓ Completed
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="rounded-lg shadow-sm border p-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}