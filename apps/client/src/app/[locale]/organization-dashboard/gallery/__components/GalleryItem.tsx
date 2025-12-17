'use client';

import { useState } from 'react';
import { IconCopy, IconTrash } from '@tabler/icons-react';
import Image from 'next/image';
import { GalleryItem as IGalleryItem } from '@/lib/hooks/gallery/useGallery';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import useGeneralStore from '@/lib/store/generalStore';
import { toast } from 'react-toastify';

interface GalleryItemProps {
  item: IGalleryItem;
  onCopy: (url: string) => void;
  onClick: () => void;
  onDelete: (id: string) => Promise<void>;
  deleting?: boolean;
}

export function GalleryItem({ item, onCopy, onClick, onDelete, deleting = false }: GalleryItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      useGeneralStore.setState({ generalIsLoading: true })
      await onDelete(item._id);
      setIsDeleteDialogOpen(false);
      toast.success('Image deleted successfully');
    } catch (error:any) {
      toast.error(error.message || 'Failed to delete image');
    } finally {
      useGeneralStore.setState({ generalIsLoading: false })
    }
  };

  return (
    <>
      <div
        className="group relative aspect-square rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all md:hover:-translate-y-1 cursor-pointer"
        onClick={onClick}
      >
        <div className="absolute inset-0 z-10 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy(item.url);
            }}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-colors cursor-pointer"
            title="Copy URL"
          >
            <IconCopy size={20} />
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={deleting}
            className="p-2 bg-white/10 hover:bg-red-500/70 text-white rounded-full backdrop-blur-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Delete"
          >
            <IconTrash size={20} />
          </button>
        </div>

        {item.type?.startsWith('image/') ? (
          <Image
            src={item.url}
            alt={item.title || 'Gallery Item'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/30 p-4">
            <div className="text-4xl mb-2">📄</div>
            <span className="text-xs text-center truncate w-full px-2 text-muted-foreground">
              {item.title}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs truncate font-medium">{item.title}</p>
          <p className="text-[10px] text-white/70">
            {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{item.title || 'this image'}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setIsDeleteDialogOpen(false)}
              // className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-background hover:bg-accent transition-colors"
              variant="outline"
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              variant="destructive"
              effect="expandIcon"
              icon={IconTrash}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

