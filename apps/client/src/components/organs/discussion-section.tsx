import { useState } from 'react';
import { DiscussionType } from '@/lib/types/discussion/discussion.types';
import { DiscussionForm } from './discussion-form';
import { DiscussionList } from './discussion-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/atoms/collapsible';
import { MessageSquare, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDiscussion } from '@/lib/hooks/discussion/useDiscussion.hook';
import { Button } from '@/components/atoms/button';
import { useTranslations } from 'next-intl';

interface DiscussionSectionProps {
  type: DiscussionType;
  entityId: string;
  courseId?: string;
  moduleId?: string;
  contentId?: string;
  currentUserId?: string;
  title?: string;
}

export function DiscussionSection({ type, entityId, courseId, moduleId, contentId, currentUserId, title }: DiscussionSectionProps) {
  const t = useTranslations('StudentCourses.discussion');
  const [isOpen, setIsOpen] = useState(false);
  const displayTitle = title || t('defaultTitle');

  const { discussions, total, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, createDiscussion, refetch } = useDiscussion({
    type,
    // Use courseId if provided and reasonable fallback logic as discussed
    entityId: courseId || entityId,
    moduleId,
    contentId,
    enabled: isOpen,
  });

  const handleCreateDiscussion = async (content: string) => {
    try {
      await createDiscussion(content);
    } catch (error: any) {
      // Error handling is already in the hook, but we can do extra here if needed
    }
  };

  return (
    <Card className="mt-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                <MessageSquare className="h-5 w-5" />
                <CardTitle className="text-lg">{displayTitle}</CardTitle>
                {total > 0 && <span className="text-muted-foreground text-sm">({total})</span>}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            <div>
              <h4 className="mb-3 text-sm font-medium">{t('startDiscussion')}</h4>
              <DiscussionForm onSubmit={handleCreateDiscussion} placeholder={t('placeholder')} submitLabel={t('postDiscussion')} />
            </div>

            <div className="border-t pt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <DiscussionList
                    discussions={discussions}
                    currentUserId={currentUserId}
                    // onReply removed
                    onUpdate={refetch}
                    type={type}
                    entityId={entityId}
                    moduleId={moduleId}
                    contentId={contentId}
                  />
                  {hasNextPage && (
                    <div className="flex justify-center pt-4">
                      <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('loading')}
                          </>
                        ) : (
                          t('loadMore')
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
