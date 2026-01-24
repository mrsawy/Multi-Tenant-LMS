import React, { ReactEventHandler, use, useEffect, useState, useCallback, useRef } from 'react';
// @ts-ignore - react-player types can be inconsistent
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, Gauge } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { VideoType } from '@/lib/types/course/enum/VideoType.enum';
import { IContent } from '@/lib/types/course/content.interface';
import { useRouter } from '@/i18n/navigation';
import VideoDice from '@/components/molecules/video-player/Video-dice';
import YoutubeVideoPlayer from '@/components/molecules/video-player/youtube-video-player';
import { useTranslations } from 'next-intl';
import ReactYoutubePlayer from '@/components/molecules/video-player/react-youtube-player';
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const VideoContent: React.FC<{
  content: IContent, isComplete: boolean,
  toggleComplete: (args: { completed: boolean, withToast: boolean, withRefresh: boolean }) => Promise<void>
}> = ({ toggleComplete, isComplete, content }) => {
  const t = useTranslations('StudentCourses.videoContent');
  const [url, setUrl] = useState(content.videoUrl || "");
  const [playedPercentage, setPlayedPercentage] = useState(0);
  const [isUploadedVideo, setIsUploadedVideo] = useState(false);
  const hasCompletedRef = useRef(isComplete);

  useEffect(() => {
    if (content.videoType === VideoType.UPLOAD) {
      setUrl(content.fileKey ?? "");
      setIsUploadedVideo(true);
    } else {
      setUrl(content.videoUrl || "");
      setIsUploadedVideo(false);
    }
  }, [content.videoType, content.fileKey, content.videoUrl]);


  const handlePercentageUpdate = useCallback(async (percentage: number) => {
    setPlayedPercentage(percentage);
    if (percentage > 0.9 && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      await toggleComplete({ completed: true, withRefresh: false, withToast: true });
    }
  }, [toggleComplete]);

  if (!url) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-6">
          <div className="text-center text-gray-500">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{t('noVideoUrl')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto ">
      <div
        id="video-player-wrapper"
        className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6 group dir-ltr"
      >
        {isUploadedVideo
          ?
          (<VideoDice url={url} onPlayedPercentageUpdate={handlePercentageUpdate} />)
          : <ReactYoutubePlayer url={url} onPlayedPercentageUpdate={handlePercentageUpdate} />
          // : (<YoutubeVideoPlayer url={url} onPlayedPercentageUpdate={handlePercentageUpdate} />)
        }

      </div>

      <div className="text-center space-y-4 ">
        {content.title && (
          <h3 className="text-xl font-semibold">{content.title}</h3>
        )}

        <div className="flex items-center justify-center gap-2">
          <div className="text-sm text-gray-600">
            {t('progress')} {Math.round(playedPercentage * 100)}%
          </div>
          {hasCompletedRef.current && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              {t('watched')}
            </span>
          )}
        </div>

        <Button
          size="lg"
          disabled={hasCompletedRef.current}
          className={hasCompletedRef.current ? 'bg-green-600 hover:bg-green-600' : ''}
        >
          {hasCompletedRef.current ? t('watched') : t('completeToMark')}
        </Button>
      </div>
    </div>
  );
};

export default VideoContent;