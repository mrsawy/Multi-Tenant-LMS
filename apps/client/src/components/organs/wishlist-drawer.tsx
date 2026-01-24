'use client';

import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/atoms/sheet';
import { Button } from '@/components/atoms/button';
import { Heart } from 'lucide-react';
import { useWishlist, useRemoveFromWishlist } from '@/lib/hooks/wishlist/use-wishlist.hook';
import { ICourse } from '@/lib/types/course/course.interface';
import { IWishlist } from '@/lib/types/wishlist/wishlist.interface';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getFileFullUrl } from '@/lib/utils/getFileFullUrl';
import { Price } from '@/components/molecules/price';
import { Currency } from '@/lib/data/currency.enum';
import { Typography } from '@/components/atoms/typography';
import { Separator } from '@/components/atoms/separator';
import { WishlistHeartButton } from '@/components/molecules/wishlist-heart-button';

interface WishlistDrawerProps {
    children: React.ReactNode;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ children }) => {
    const [open, setOpen] = React.useState(false);
    const { data: wishlistData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useWishlist({});
    const removeMutation = useRemoveFromWishlist();

    // Flatten all pages to get all wishlist items
    const wishlistItems = wishlistData?.pages.flatMap((page) => page.docs) ?? [];
    const totalCount = wishlistData?.pages[0]?.totalDocs ?? 0;

    // Filter items that have course data (should be all items now that we store course data in localStorage)
    const itemsWithCourses: Array<IWishlist & { course: ICourse }> = wishlistItems
        .map((item) => {
            // If item has course data, use it
            if (item.course && typeof item.course === 'object') {
                return { ...item, course: item.course as ICourse };
            }
            return null;
        })
        .filter((item): item is IWishlist & { course: ICourse } => item !== null);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg gap-0">
                <SheetHeader className="border-b-2 ">
                    <SheetTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                        My Wishlist
                    </SheetTitle>
                    <SheetDescription>
                        {totalCount} {totalCount === 1 ? 'course' : 'courses'} in your wishlist
                    </SheetDescription>
                </SheetHeader>

                <div
                    className="h-[calc(100vh-120px)] overflow-y-auto pt-8 custom-scrollbar"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'transparent transparent',
                    }}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Typography variant="p" color="muted">
                                Loading wishlist...
                            </Typography>
                        </div>
                    ) : wishlistItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <Typography variant="h3" className="mb-2">
                                Your wishlist is empty
                            </Typography>
                            <Typography variant="p" color="muted" className="mb-6">
                                Start adding courses you're interested in!
                            </Typography>
                            <Button onClick={() => setOpen(false)} asChild>
                                <Link href="/courses">Browse Courses</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {itemsWithCourses.map((item, index, arr) => {
                                const course = item.course;

                                return (
                                    <div key={item._id} className="group px-5">
                                        <div className="flex gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors ">
                                            <Link
                                                href={`/courses/${course._id}`}
                                                className="relative shrink-0"
                                                onClick={() => setOpen(false)}
                                            >
                                                <div className="relative w-24 h-16 sm:w-32 sm:h-20 rounded-md overflow-hidden">
                                                    <Image
                                                        src={getFileFullUrl(course.thumbnailKey ?? '')}
                                                        alt={course.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </Link>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <Link
                                                        href={`/courses/${course._id}`}
                                                        className="flex-1 min-w-0"
                                                        onClick={() => setOpen(false)}
                                                    >
                                                        <Typography
                                                            variant="h4"
                                                            weight="semibold"
                                                            className="line-clamp-2 group-hover:text-primary transition-colors"
                                                        >
                                                            {course.name}
                                                        </Typography>
                                                    </Link>
                                                    <WishlistHeartButton
                                                        courseId={course._id}
                                                        course={course}
                                                        size="sm"
                                                        variant="ghost"
                                                    />
                                                </div>

                                                {course.instructor && (
                                                    <Typography variant="p" size="sm" color="muted" className="mb-2">
                                                        by {course.instructor.firstName} {course.instructor.lastName}
                                                    </Typography>
                                                )}

                                                <div className="flex items-center justify-between gap-2">
                                                    <Price
                                                        isPaid={course.isPaid}
                                                        pricing={course.pricing}
                                                        preferredCurrency={Currency.EGP}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        asChild
                                                        onClick={() => setOpen(false)}
                                                    >
                                                        <Link href={`/courses/${course._id}`}>
                                                            View Course
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        {index !== arr.length - 1 && <Separator className="mt-4" />}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Load More Button */}
                    {hasNextPage && (
                        <div className="flex justify-center py-4">
                            <Button
                                variant="outline"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? 'Loading...' : 'Load More'}
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};
