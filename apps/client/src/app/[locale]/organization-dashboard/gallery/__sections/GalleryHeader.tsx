'use client';

interface GalleryHeaderProps {
  itemCount: number;
}

export function GalleryHeader({ itemCount }: GalleryHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Media Gallery
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your organization's assets and files.
        </p>
      </div>
      <div className="text-sm text-muted-foreground">
        {itemCount} items
      </div>
    </div>
  );
}

