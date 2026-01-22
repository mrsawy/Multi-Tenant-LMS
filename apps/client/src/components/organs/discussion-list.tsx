'use client';

import { IDiscussionWithReplies, DiscussionType } from '@/lib/types/discussion/discussion.types';
import { DiscussionItem } from './discussion-item';
import { useTranslations } from 'next-intl';

interface DiscussionListProps {
  discussions: IDiscussionWithReplies[];
  currentUserId?: string;
  onUpdate: () => void;
  type: DiscussionType;
  entityId: string;
  moduleId?: string;
  contentId?: string;
}

export function DiscussionList({
  discussions,
  currentUserId,
  onUpdate,
  type,
  entityId,
  moduleId,
  contentId,
}: DiscussionListProps) {
  const t = useTranslations('StudentCourses.discussion');
  
  if (discussions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">{t('noDiscussions')}</p>
        <p className="text-sm mt-1">{t('beFirst')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {discussions.map((discussion) => (
          <DiscussionItem
            key={discussion._id}
            discussion={discussion}
            currentUserId={currentUserId}
            onUpdate={onUpdate}
            type={type}
            entityId={entityId}
            moduleId={moduleId}
            contentId={contentId}
          />
        ))}
      </div>
    </div>
  );
}
