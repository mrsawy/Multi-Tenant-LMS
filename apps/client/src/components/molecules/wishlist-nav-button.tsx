'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';
import { WishlistDrawer } from '@/components/organs/wishlist-drawer';
import { useWishlist } from '@/lib/hooks/wishlist/use-wishlist.hook';

export const WishlistNavButton: React.FC = () => {
    const { data: wishlistData } = useWishlist({});
    // Get total count from first page
    const count = wishlistData?.pages[0]?.totalDocs ?? 0;

    return (
        <WishlistDrawer>
            <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 hover:bg-transparent hover:text-white group"
                aria-label="Wishlist"
            >
                <Heart className="h-5 w-5 transition-all group-hover:fill-red-500 group-hover:text-red-500" />
                {count > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-semibold"
                    >
                        {count > 99 ? '99+' : count}
                    </Badge>
                )}
            </Button>
        </WishlistDrawer>
    );
};
