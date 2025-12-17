'use client';

import { useRef, useEffect } from 'react';
import { GalleryItem as IGalleryItem } from '@/lib/hooks/gallery/useGallery';
import { GalleryItem } from '../__components/GalleryItem';

interface GalleryGridProps {
  items: IGalleryItem[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onItemClick: (index: number) => void;
  onCopy: (url: string) => void;
  onDelete: (id: string) => Promise<void>;
  deleting?: boolean;
}

export function GalleryGrid({
  items,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onItemClick,
  onCopy,
  onDelete,
  deleting = false,
}: GalleryGridProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, onLoadMore]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {items.map((item, index) => (
          <GalleryItem
            key={item._id}
            item={item}
            onCopy={onCopy}
            onClick={() => onItemClick(index)}
            onDelete={onDelete}
            deleting={deleting}
          />
        ))}
      </div>

      {/* Loading More Indicator */}
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-6">
          {loadingMore ? (
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-muted-foreground text-sm">Scroll for more</span>
          )}
        </div>
      )}
    </>
  );
}

