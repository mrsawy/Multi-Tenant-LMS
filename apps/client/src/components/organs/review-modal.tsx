'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { Textarea } from '@/components/atoms/textarea';
import { Star } from 'lucide-react';
import { createReview } from '@/lib/actions/review/createReview.action';
import { getOwnReview } from '@/lib/actions/review/getOwnReview.action';
import { ReviewType } from '@/lib/types/review/review.types';
import useGeneralStore from '@/lib/store/generalStore';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ReviewModalProps {
  type: ReviewType;
  entityId: string; // The ID of the Course, Module, or Content
  courseId?: string; // For Module/Content reviews if needed contexts
  trigger?: React.ReactNode;
}

export function ReviewModal({ type, entityId, courseId, trigger }: ReviewModalProps) {
  const t = useTranslations('StudentCourses.reviewModal');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [existingReview, setExistingReview] = useState<{
    rating?: number;
    comment?: string;
  } | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const { generalIsLoading: isSubmitting, setGeneralIsLoading: setIsSubmitting } = useGeneralStore();

  // Fetch existing review when modal opens
  useEffect(() => {
    fetchExistingReview();
  }, [isOpen]);

  const fetchExistingReview = async () => {
    setIsLoadingReview(true);
    try {
      const filters: any = { reviewType: type };

      if (type === ReviewType.COURSE) filters.courseId = entityId;
      if (type === ReviewType.MODULE) filters.moduleId = entityId;
      if (type === ReviewType.CONTENT) filters.contentId = entityId;

      const review: any = await getOwnReview(filters);

      if (review) {
        setExistingReview(review);
        setRating(review.rating || 0);
        setComment(review.comment || '');
      } else {
        setExistingReview(null);
        setRating(0);
        setComment('');
      }
    } catch (error) {
      console.error('Failed to fetch existing review:', error);
      // Don't show error toast, just proceed as if no review exists
    } finally {
      setIsLoadingReview(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(t('pleaseSelectRating'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Construct Input
      const input: any = {
        reviewType: type,
        rating,
        comment,
      };

      if (type === ReviewType.COURSE) input.courseId = entityId;
      if (type === ReviewType.MODULE) {
        input.moduleId = entityId;
      }
      if (type === ReviewType.CONTENT) {
        input.contentId = entityId;
      }

      await createReview(input);

      toast.success(existingReview ? t('reviewUpdated') : t('reviewSubmitted'));
      setIsOpen(false);
      setRating(0);
      setComment('');
      setExistingReview(null);
    } catch (error: any) {
      toast.error(error.message || t('failedToSubmit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Star className={cn('size-4', existingReview ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')} />
            <span className="sr-only">
              {type === ReviewType.COURSE ? t('rateCourse') : type === ReviewType.MODULE ? t('rateModule') : t('rateContent')}
            </span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? t('update') : t('rate')} {t('this')} {type === ReviewType.COURSE ? t('courseType') : type === ReviewType.MODULE ? t('moduleType') : t('contentType')}
          </DialogTitle>
          <DialogDescription>{existingReview ? t('updateDescription') : t('shareDescription')}</DialogDescription>
        </DialogHeader>
        {isLoadingReview ? (
          <div className="text-muted-foreground py-8 text-center">{t('loadingReview')}</div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="flex justify-center space-x-2 ">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" className="focus:outline-none" onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)}>
                    <Star className={`h-8 w-8 ${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comment">{t('commentLabel')}</Label>
                <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('commentPlaceholder')} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? t('submitting') : existingReview ? t('updateReview') : t('submitReview')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
