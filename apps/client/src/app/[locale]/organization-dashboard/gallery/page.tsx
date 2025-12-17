'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useGallery } from '@/lib/hooks/gallery/useGallery';
import { GalleryHeader } from './__sections/GalleryHeader';
import { GalleryGrid } from './__sections/GalleryGrid';
import { EmptyState } from './__sections/EmptyState';
import { UploadZone } from './__components/UploadZone';
import { ImageModal } from './__components/ImageModal';

export default function GalleryPage() {
  const [progress, setProgress] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onProgress = useCallback((progressEvent: any) => {
    setProgress(progressEvent.percentage);
  }, []);

  const { items, loading, uploading, deleting, uploadFile, deleteFile, loadMore, hasMore, loadingMore } = useGallery({ onProgress });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setProgress(0);
        uploadFile(acceptedFiles[0]);
      }
    },
    [uploadFile]
  );

  const handleItemClick = useCallback((index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  }, []);

  const handleCopy = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteFile(id);
        // Close modal if no items remain
        if (items.length === 1) {
          setIsModalOpen(false);
        }
      } catch (error) {
        // Error is handled by the hook
      }
    },
    [deleteFile, items.length]
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <GalleryHeader itemCount={items.length} />

      <UploadZone onDrop={handleDrop} uploading={uploading} progress={progress} />

      {items.length === 0 && !loading ? (
        <EmptyState />
      ) : (
        <GalleryGrid
          items={items}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onItemClick={handleItemClick}
          onCopy={handleCopy}
          onDelete={handleDelete}
          deleting={deleting}
        />
      )}

      <ImageModal
        items={items}
        initialIndex={selectedIndex}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDelete={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
