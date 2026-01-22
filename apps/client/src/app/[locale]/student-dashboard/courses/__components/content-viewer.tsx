'use client';
import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { usePathname, useRouter } from '@/i18n/navigation';
import { IContent } from '@/lib/types/course/content.interface';
import { CourseContentType } from '@/lib/types/course/enum/CourseContentType.enum';
import { Clock, FileText, HelpCircle, PenTool, Play, Star } from 'lucide-react';
import { ReviewModal } from '@/components/organs/review-modal';
import { ReviewType } from '@/lib/types/review/review.types';
import { useTranslations } from 'next-intl';

interface ContentViewerProps {
  content: IContent;
  isCompleted: boolean;
}

export function ContentViewer({ content, isCompleted = false }: ContentViewerProps) {
  const t = useTranslations('StudentCourses.contentViewer');
  const tContentTypes = useTranslations('StudentCourses.contentTypes');
  const router = useRouter();
  const pathName = usePathname();

  const getContentIcon = (type: CourseContentType) => {
    switch (type) {
      case CourseContentType.VIDEO:
        return <Play className="h-4 w-4" />;
      case CourseContentType.ARTICLE:
        return <FileText className="h-4 w-4" />;
      case CourseContentType.ASSIGNMENT:
        return <PenTool className="h-4 w-4" />;
      case CourseContentType.QUIZ:
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: CourseContentType) => {
    switch (type) {
      case CourseContentType.VIDEO:
        return 'bg-blue-500';
      case CourseContentType.ARTICLE:
        return 'bg-green-500';
      case CourseContentType.ASSIGNMENT:
        return 'bg-orange-500';
      case CourseContentType.QUIZ:
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    return `${minutes} ${t('min')}`;
  };

  return (
    <Card className={`transition-shadow hover:shadow-md`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${getContentTypeColor(content.type)}`}>{getContentIcon(content.type)}</div>
            <div>
              <CardTitle className="text-base font-medium">{content.title}</CardTitle>
              {content.description && <p className="text-muted-foreground mt-1 text-sm">{content.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getContentTypeColor(content.type).replace('bg-', 'border-')}>
              {tContentTypes(content.type)}
            </Badge>
            {isCompleted && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {t('completed')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            {content.quizDurationInMinutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(content.quizDurationInMinutes)}</span>
              </div>
            )}
            {content.maxPoints && <span>{content.maxPoints} {t('points')}</span>}
            {content.dueDate && <span>{t('due')} {new Date(content.dueDate).toLocaleDateString()}</span>}
          </div>

          <div className="flex items-center gap-2">
            <ReviewModal type={ReviewType.CONTENT} entityId={content._id} />

            <Button
              variant={isCompleted ? 'outline' : 'default'}
              size="sm"
              onClick={() => {
                router.push(pathName + '/' + content._id);
              }}>
              {isCompleted ? t('review') : t('start')}
            </Button>
          </div>
        </div>

        {content.type === CourseContentType.QUIZ && content.questions && (
          <div className="text-muted-foreground mt-3 text-sm">
            {content.questions.length} {content.questions.length !== 1 ? t('questionsPlural') : t('questions')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
