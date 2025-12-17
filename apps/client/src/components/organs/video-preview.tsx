import { Button } from '@/components/atoms/button';
import { Play } from 'lucide-react';
import React from 'react';

const VideoPreview = React.memo(() => {
    return (
        <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
            <Button size="lg" className="h-16 w-16 rounded-full">
                <Play className="h-6 w-6 ml-1" />
            </Button>
        </div>
    );
});

export default VideoPreview;