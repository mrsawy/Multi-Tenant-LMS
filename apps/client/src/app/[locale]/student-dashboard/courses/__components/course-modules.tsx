import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { ChartLegendContent } from "@/components/atoms/chart";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/atoms/collapsible";
import { Progress } from "@/components/atoms/progress";
import { IModuleWithContents } from "@/lib/types/course/modules.interface";
import { BookOpenCheck, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ContentViewer } from "./content-viewer";
import { ReviewModal } from "@/components/organs/review-modal";
import { ReviewType } from "@/lib/types/review/review.types";
import { Star } from "lucide-react";
import { DiscussionSection } from "@/components/organs/discussion-section";
import { DiscussionType } from "@/lib/types/discussion/discussion.types";
import { useTranslations } from "next-intl";



interface CourseModulesProps {
    modules: IModuleWithContents[];
    completedModules: string[];
    completedContents: string[];
}

export function CourseModules({
    modules,
    completedModules,
    completedContents,
}: CourseModulesProps) {
    const t = useTranslations('StudentCourses.courseModules');
    const [openModules, setOpenModules] = useState<string[]>([modules[0]?._id || ""]);

    const toggleModule = (moduleId: string) => {
        setOpenModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const getModuleProgress = (module: IModuleWithContents) => {
        const totalContents = module.contents.length;
        const completedModuleContents = !completedContents ? 0 : module.contents.filter(content =>
            completedContents.includes(content._id)
        ).length;
        return totalContents > 0 ? (completedModuleContents / totalContents) * 100 : 0;
    };

    const isModuleCompleted = (moduleId: string) => {
        return completedModules.includes(moduleId);
    };

    return (
        <div className="space-y-4">
            {modules.map((module, index) => {
                const isCompleted = isModuleCompleted(module._id);
                const progress = getModuleProgress(module);
                const isOpen = openModules.includes(module._id);

                return (
                    <Card key={module._id} className={isCompleted ? 'border-green-200' : ''}>
                        <Collapsible open={isOpen} onOpenChange={() => toggleModule(module._id)}>
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer  transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                {isOpen ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium 
                                                ${isCompleted
                                                        ? 'bg-green-500 '
                                                        : 'bg-gray-200 '
                                                    }`
                                                }>
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-4 h-4" />
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-semibold">
                                                    {module.title}
                                                </CardTitle>
                                                {module.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {module.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <ReviewModal
                                                    type={ReviewType.MODULE}
                                                    entityId={module._id}
                                                />
                                            </div>
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <BookOpenCheck className="w-3 h-3" />
                                                {module.contents.length} {t('items')}
                                            </Badge>
                                            {isCompleted && (
                                                <Badge className="bg-green-500">
                                                    {t('completed')}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {!isCompleted && progress > 0 && (
                                        <div className="mt-3 space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span>{t('progress')}</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                        </div>
                                    )}
                                </CardHeader>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <CardContent className="pt-0">
                                    {module.learningObjectives.length > 0 && (
                                        <div className="mb-4 p-3 rounded-lg bg-muted/40">
                                            <h4 className="font-medium text-sm mb-2">{t('learningObjectives')}</h4>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                {module.learningObjectives.map((objective, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <span className="text-blue-500 mt-1">•</span>
                                                        <span>{objective}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {module.contents.map((content) => (
                                            <ContentViewer
                                                key={content._id}
                                                content={content}
                                                // enrollmentId={enroll}
                                                isCompleted={completedContents.includes(content._id)}
                                            />
                                        ))}
                                    </div>

                                    {/* Module Discussions */}
                                    <div className="mt-4">
                                        <DiscussionSection
                                            type={DiscussionType.MODULE}
                                            entityId={module._id}
                                            moduleId={module._id}
                                            title={t('moduleDiscussions')}
                                        />
                                    </div>
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                );
            })}
        </div>
    );
}