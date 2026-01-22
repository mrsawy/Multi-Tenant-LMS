'use client';

import { useEffect, useState } from 'react';
import { IDiscussionWithReplies, DiscussionType } from '@/lib/types/discussion/discussion.types';
import { Button } from '@/components/atoms/button';
import { Heart, MessageCircle, MoreVertical, Pencil, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { DiscussionForm } from './discussion-form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/atoms/dropdown-menu';
import { cn } from '@/lib/utils';
import { useDiscussion } from '@/lib/hooks/discussion/useDiscussion.hook';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { AvatarFallback } from '../atoms/avatar';
import { getFileFullUrl } from '@/lib/utils/getFileFullUrl';
import { useTranslations } from 'next-intl';

interface DiscussionItemProps {
  discussion: IDiscussionWithReplies;
  currentUserId?: string;
  // onUpdate is still useful if parent list passes it, but refetching is handled via query invalidation mostly.
  onUpdate: () => void;
  type: DiscussionType;
  entityId: string;
  moduleId?: string;
  contentId?: string;
  depth?: number;
}

export function DiscussionItem({ discussion, currentUserId, onUpdate, type, entityId, moduleId, contentId, depth = 0 }: DiscussionItemProps) {
  const t = useTranslations('StudentCourses.discussion.item');
  const tForm = useTranslations('StudentCourses.discussion.form');
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const isOwner = currentUserId === discussion.userId;
  const maxDepth = 5;
  const canReply = depth < maxDepth;

  // Use the hook for this specific discussion item context
  // If parentId is passed, it acts as a "replies manager" for this discussion.
  // Note: For actions on the discussion itself (edit, delete, like), we can use the hook's helpers.
  // We pass enabled: showReplies so it only fetches when expanded.
  const {
    discussions: replies,
    isLoading: isLoadingReplies,
    createDiscussion: createReply,
    updateDiscussion,
    deleteDiscussion,
    toggleLike,
    refetch,
    total: repliesCountFromHook, // Use total from hook as the source of truth for replies count
  } = useDiscussion({
    type,
    entityId,
    moduleId,
    contentId,
    parentId: discussion._id,
    enabled: showReplies,
  });
  useEffect(() => {
    console.log({ replies });
  }, [replies]);

  // Since repliesCount might not be accurate in the single discussion object if we haven't refetched the parent list,
  // we could rely on the hook's total if we have fetched.
  // Ideally, use `discussion.repliesCount` initially, and if `showReplies` is true (meaning we fetched), use `repliesCountFromHook`.
  const currentRepliesCount = showReplies && replies ? repliesCountFromHook : discussion.repliesCount;

  // Local optimistic/display state for Like is handled by query invalidation, but we can rely on props.
  const isLiked = discussion.likedBy?.includes(currentUserId || '') || false;
  const currentLikesCount = discussion.likesCount;

  const handleReply = async (content: string) => {
    try {
      await createReply(content);
      setIsReplying(false);
      // Ensure replies are shown and re-fetched
      if (!showReplies) {
        setShowReplies(true);
      }
      // Query invalidation in hook should trigger refetch of replies automatically if enabled
    } catch (error) {
      // Hook handles error toast
    }
  };

  const handleEdit = async (content: string) => {
    try {
      await updateDiscussion({ id: discussion._id, content });
      setIsEditing(false);
      // onUpdate prop comes from parent list's useDiscussion.refetch
      // Calling it ensures parent list reflects change (e.g. content update)
      onUpdate();
    } catch (error) {
      // Hook handles error toast
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    try {
      await deleteDiscussion(discussion._id);
      onUpdate(); // Update parent list
    } catch (error) {
      // Hook handles error toast
    }
  };

  const handleToggleLike = async () => {
    try {
      await toggleLike(discussion._id);
      onUpdate(); // Update parent list
    } catch (error) {
      // Hook handles error toast
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t('justNow');
    if (diffInSeconds < 3600) return t('minutesAgo', { minutes: Math.floor(diffInSeconds / 60) });
    if (diffInSeconds < 86400) return t('hoursAgo', { hours: Math.floor(diffInSeconds / 3600) });
    if (diffInSeconds < 604800) return t('daysAgo', { days: Math.floor(diffInSeconds / 86400) });

    return date.toLocaleDateString();
  };

  const userFullName = discussion.user?.firstName + ' ' + discussion.user?.lastName;

  return (
    <div className={cn('space-y-3', depth > 0 && 'ml-8 border-l-2 border-gray-200 pl-4')}>
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-3">
            <Avatar>
              <AvatarFallback className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-semibold text-white">{userFullName || 'U'}</AvatarFallback>
              <AvatarImage className='size-10 rounded-full' src={getFileFullUrl(discussion.user?.profile?.avatar)} />
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{userFullName || t('anonymous')}</span>
                <span className="text-muted-foreground text-xs">{formatDate(discussion.createdAt)}</span>
                {discussion.isEdited && <span className="text-muted-foreground text-xs italic">{t('edited')}</span>}
              </div>

              {isEditing ? (
                <div className="mt-2">
                  <DiscussionForm onSubmit={handleEdit} onCancel={() => setIsEditing(false)} initialContent={discussion.content} submitLabel={t('save')} />
                </div>
              ) : (
                <p className="mt-1 whitespace-pre-wrap break-words text-sm">{discussion.content}</p>
              )}

              <div className="mt-3 flex items-center gap-4">
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={handleToggleLike}>
                  <Heart className={cn('mr-1 h-4 w-4', isLiked && 'fill-red-500 text-red-500')} />
                  {currentLikesCount > 0 && currentLikesCount}
                </Button>

                {canReply && (
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setIsReplying(!isReplying)}>
                    <MessageCircle className="mr-1 h-4 w-4" />
                    {t('reply')}
                  </Button>
                )}

                {/* Show replies button if there are replies OR if we are showing them (even if count is 0, to collapse) */}
                {(discussion.repliesCount > 0 || showReplies) && (
                  <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-2 text-xs" onClick={toggleReplies}>
                    {isLoadingReplies ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : showReplies ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
                    {/* Use the best available count */}
                    {currentRepliesCount} {currentRepliesCount === 1 ? t('reply') : t('replies')}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {isOwner && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {isReplying && <DiscussionForm onSubmit={handleReply} onCancel={() => setIsReplying(false)} placeholder={tForm('writeReply')} submitLabel={t('reply')} isReply />}

      {showReplies && replies && replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((reply) => (
            <DiscussionItem
              key={reply._id}
              discussion={reply}
              currentUserId={currentUserId}
              onUpdate={refetch} // Refetch THIS item's replies list when a child updates
              type={type}
              entityId={entityId}
              moduleId={moduleId}
              contentId={contentId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
