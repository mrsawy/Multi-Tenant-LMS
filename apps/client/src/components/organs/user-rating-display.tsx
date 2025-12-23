"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getOwnReview } from "@/lib/actions/review/getOwnReview.action";
import { ReviewType } from "@/lib/types/review/review.types";
import { ReviewModal } from "./review-modal";
import { Button } from "../atoms/button";

interface UserRatingDisplayProps {
    reviewType: ReviewType;
    entityId: string;
    courseId?: string;
    showLabel?: boolean;
}

export function UserRatingDisplay({ reviewType, entityId, courseId, showLabel = true }: UserRatingDisplayProps) {
    const [userRating, setUserRating] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUserRating();
    }, [reviewType, entityId]);

    const fetchUserRating = async () => {
        try {
            const filters: any = { reviewType };
            
            if (reviewType === ReviewType.COURSE) filters.courseId = entityId;
            if (reviewType === ReviewType.MODULE) filters.moduleId = entityId;
            if (reviewType === ReviewType.CONTENT) filters.contentId = entityId;
            
            const review: any = await getOwnReview(filters);
            setUserRating(review?.rating || 0);
        } catch (error) {
            console.error("Failed to fetch user rating:", error);
            setUserRating(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReviewUpdate = () => {
        // Refresh the rating after review is submitted
        fetchUserRating();
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-1">
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
            </div>
        );
    }

    return (
        <ReviewModal
            type={reviewType}
            entityId={entityId}
            courseId={courseId}
            trigger={
                <Button className="flex items-center gap-1 hover:opacity-80 transition-opacity" variant="outline">
                    {showLabel && (
                        <span className="text-sm m-1">
                            {userRating > 0 ? "Your rating" : "Rate this"}
                        </span>
                    )}
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`size-4 ${
                                userRating >= star
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                            }`}
                        />
                    ))}
                 
                </Button>
            }
        />
    );
}
