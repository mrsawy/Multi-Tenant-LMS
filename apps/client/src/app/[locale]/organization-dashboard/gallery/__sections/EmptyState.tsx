'use client';

import { IconPhoto } from '@tabler/icons-react';

export function EmptyState() {
  return (
    <div className="text-center py-20 text-muted-foreground">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <IconPhoto className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <p className="text-lg font-medium">No items yet</p>
      <p>Upload some images to get started</p>
    </div>
  );
}

