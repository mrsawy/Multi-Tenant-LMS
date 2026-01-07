import React, { ReactEventHandler, use, useEffect, useState } from 'react';
// @ts-ignore - react-player types can be inconsistent
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, Gauge } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { VideoType } from '@/lib/types/course/enum/VideoType.enum';
import { IContent } from '@/lib/types/course/content.interface';
import { useRouter } from '@/i18n/navigation';
import Video from '@/components/molecules/Video';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const VideoContent: React.FC<{
  content: IContent;
  isComplete: boolean;
  toggleComplete: (args: { completed: boolean; withToast: boolean; withRefresh: boolean }) => Promise<void>;
}> = ({ toggleComplete, isComplete, content }) => {
  const [url, setUrl] = useState(content.videoUrl || '');

  const [played, setPlayed] = useState(0);

  const [watched, setWatched] = useState(false);
  const [isUploadedVideo, setIsUploadedVideo] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (content.videoType === VideoType.UPLOAD) {
      setUrl(content.fileKey ?? '');
      setIsUploadedVideo(true);
    } else {
      setUrl(content.videoUrl || '');
      setIsUploadedVideo(false);
    }
  }, [content.videoType, content.fileKey, content.videoUrl]);

  useEffect(() => {
    return () => {
      router.refresh();
    };
  }, []);

  if (!url) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex aspect-video items-center justify-center rounded-lg bg-gray-100">
          <div className="text-center text-gray-500">
            <Play className="mx-auto mb-4 h-16 w-16 opacity-50" />
            <p>No video URL provided</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Video url={url} toggleComplete={toggleComplete} played={played} setPlayed={setPlayed} watched={watched} setWatched={setWatched} isUploadedVideo={isUploadedVideo} />
      <div className="space-y-4 text-center">
        {content.title && <h3 className="text-xl font-semibold">{content.title}</h3>}

        <div className="flex items-center justify-center gap-2">
          <div className="text-sm text-gray-600">Progress: {Math.round(played * 100)}%</div>
          {watched && <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">✓ Watched</span>}
        </div>

        <Button size="lg" disabled={watched} className={watched ? 'bg-green-600 hover:bg-green-600' : ''}>
          {watched ? '✓  Watched' : 'Complete up to 90% to mark as completed'}
        </Button>
      </div>
    </div>
  );
};

export default VideoContent;
