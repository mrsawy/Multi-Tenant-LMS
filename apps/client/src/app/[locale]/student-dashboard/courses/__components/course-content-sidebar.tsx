"use client";

import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Progress } from "@/components/atoms/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/atoms/collapsible";
import { Sheet, SheetContent, SheetTrigger } from "@/components/atoms/sheet";
import { ICourseOverview } from "@/lib/types/course/course.interface";
import { IEnrollment } from "@/lib/types/enrollment/enrollment.interface";
import { IContent } from "@/lib/types/course/content.interface";
import { CourseContentType } from "@/lib/types/course/enum/CourseContentType.enum";
import {
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Play,
    FileText,
    HelpCircle,
    PenTool,
    Clock,
    MoreVertical,
    List
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/atoms/avatar";
import { IUser } from "@/lib/types/user/user.interface";

interface CourseContentSidebarProps {
    course: ICourseOverview;
    enrollment: IEnrollment;
    currentContentId?: string;
    user?: IUser;
}

export function CourseContentSidebar({
    course,
    enrollment,
    currentContentId,
    user
}: CourseContentSidebarProps) {
    const t = useTranslations('StudentCourses.contentView');
    const tContentTypes = useTranslations('StudentCourses.contentTypes');
    const router = useRouter();

    // Find the module that contains the current content
    const getInitialOpenModules = () => {
        if (!currentContentId) {
            return course.modules.length > 0 ? [course.modules[0]._id] : [];
        }

        // Find which module contains the current content
        const moduleWithCurrentContent = course.modules.find(module =>
            module.contents.some(content => content._id === currentContentId)
        );

        if (moduleWithCurrentContent) {
            return [moduleWithCurrentContent._id];
        }

        // Fallback to first module if not found
        return course.modules.length > 0 ? [course.modules[0]._id] : [];
    };

    const [openModules, setOpenModules] = useState<string[]>(getInitialOpenModules());
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

    // Update open modules when currentContentId changes
    useEffect(() => {
        if (currentContentId) {
            const moduleWithCurrentContent = course.modules.find(module =>
                module.contents.some(content => content._id === currentContentId)
            );

            if (moduleWithCurrentContent) {
                setOpenModules(prev => {
                    if (!prev.includes(moduleWithCurrentContent._id)) {
                        return [moduleWithCurrentContent._id];
                    }
                    return prev;
                });
            }
        }
    }, [currentContentId]);

    const toggleModule = (moduleId: string) => {
        setOpenModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    // Calculate progress
    const totalContents = course.modules.reduce(
        (sum, module) => sum + module.contents.length,
        0
    );
    const completedContents = enrollment.progress.completedContents.length;
    const progressPercentage = totalContents > 0
        ? (completedContents / totalContents) * 100
        : 0;

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

    const getModuleProgress = (module: typeof course.modules[0]) => {
        const totalContents = module.contents.length;
        const completedModuleContents = module.contents.filter(content =>
            enrollment.progress.completedContents.includes(content._id)
        ).length;
        return totalContents > 0 ? (completedModuleContents / totalContents) * 100 : 0;
    };

    const isModuleCompleted = (moduleId: string) => {
        return enrollment.progress.completedModules.includes(moduleId);
    };

    const handleContentClick = (contentId: string) => {
        router.push(`/student-dashboard/courses/${enrollment._id}/${contentId}`);
        setMobileSheetOpen(false); // Close mobile sheet when content is clicked
    };

    const getContentDuration = (content: IContent) => {
        if (content.quizDurationInMinutes) {
            return `${content.quizDurationInMinutes} ${t('minutes')}`;
        }
        // You can add more duration logic here for videos/articles
        return null;
    };

    const getUserInitials = () => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        }
        if (user?.email) {
            return user.email[0].toUpperCase();
        }
        return "U";
    };

    // Sidebar content component (reusable for desktop and mobile)
    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Course Progress Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{t('courseContent')}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {completedContents}/{totalContents} {t('completed')}
                    </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="bg-primary h-full transition-all"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Modules List */}
            <div className="flex-1 overflow-y-auto">
                {course.modules.map((module) => {
                    const isCompleted = isModuleCompleted(module._id);
                    const progress = getModuleProgress(module);
                    const isOpen = openModules.includes(module._id);
                    const completedCount = module.contents.filter(content =>
                        enrollment.progress.completedContents.includes(content._id)
                    ).length;

                    return (
                        <div
                            key={module._id}
                            className="border-b border-slate-300 dark:border-slate-800"
                        >
                            <Collapsible open={isOpen} onOpenChange={() => toggleModule(module._id)} className="transition-all cursor-pointer">
                                <CollapsibleTrigger asChild>
                                    <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            {isOpen ? (
                                                <ChevronDown className="w-4 h-4 text-slate-400" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-slate-400" />
                                            )}
                                            <span className="font-bold text-sm text-right">
                                                {module.title}
                                            </span>
                                        </div>
                                        {isCompleted ? (
                                            <span className="text-[10px] font-bold text-green-500 uppercase">
                                                {t('completed')}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {completedCount}/{module.contents.length}
                                            </span>
                                        )}
                                    </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="py-1">
                                        {module.contents.map((content) => {
                                            const isCompleted = enrollment.progress.completedContents.includes(content._id);
                                            const isActive = currentContentId === content._id;

                                            return (
                                                <button
                                                    key={content._id}
                                                    onClick={() => handleContentClick(content._id)}
                                                    className={`w-full px-6 py-3 flex items-center gap-3 cursor-pointer transition-colors ${isActive
                                                            ? 'bg-primary/15 border-r-3 border-primary'
                                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'
                                                        }`}
                                                >
                                                    <div className={`${isActive ? 'text-primary' : 'text-slate-400'
                                                        }`}>
                                                        {getContentIcon(content.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-right">
                                                        <p className={`text-sm font-medium truncate ${isActive
                                                                ? 'text-primary'
                                                                : 'text-slate-900 dark:text-slate-100'
                                                            }`}>
                                                            {content.title}
                                                        </p>
                                                        {getContentDuration(content) && (
                                                            <p className="text-[10px] text-slate-500">
                                                                {getContentDuration(content)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    );
                })}
            </div>

            {/* User Profile Footer */}
            {user && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 p-2  hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors">
                        <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-tr from-primary to-purple-400 text-white font-bold">
                                {getUserInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                                {user.email}
                            </p>
                        </div>
                        <MoreVertical className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                </div>
            )}
        </div>
    );

    // Return just the content (for use in Sidebar component)
    return <SidebarContent />;
}

// Export a version that includes mobile sheet for standalone use
export function CourseContentSidebarWithMobile({
    course,
    enrollment,
    currentContentId,
    user
}: CourseContentSidebarProps) {
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
    const router = useRouter();

    const handleContentClick = (contentId: string) => {
        router.push(`/student-dashboard/courses/${enrollment._id}/${contentId}`);
        setMobileSheetOpen(false);
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col shrink-0 h-[calc(100vh-4rem)]">
                <CourseContentSidebar
                    course={course}
                    enrollment={enrollment}
                    currentContentId={currentContentId}
                    user={user}
                />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="lg:hidden fixed bottom-6 left-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl z-50 hover:bg-primary/90"
                    >
                        <List className="w-6 h-6" />
                        <span className="sr-only">Open course content</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                    <CourseContentSidebar
                        course={course}
                        enrollment={enrollment}
                        currentContentId={currentContentId}
                        user={user}
                    />
                </SheetContent>
            </Sheet>
        </>
    );
}
