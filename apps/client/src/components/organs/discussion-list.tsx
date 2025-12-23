'use client';

import { IDiscussionWithReplies, DiscussionType } from '@/lib/types/discussion/discussion.types';
import { DiscussionItem } from './discussion-item';

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
  if (discussions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No discussions yet</p>
        <p className="text-sm mt-1">Be the first to start a discussion!</p>
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
