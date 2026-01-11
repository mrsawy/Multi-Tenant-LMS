import {
  MediaPlayer,
  MediaPlayerControls,
  MediaPlayerControlsOverlay,
  MediaPlayerFullscreen,
  MediaPlayerPiP,
  MediaPlayerPlay,
  MediaPlayerPlaybackSpeed,
  MediaPlayerSeek,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerTime,
  MediaPlayerVideo,
  MediaPlayerVolume,
} from '@/components/atoms/media-player';
import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
type VideoProps = {
  url: string;
  onPlayedPercentageUpdate?: (percentage: number) => void;
};

export default function Video({ url, onPlayedPercentageUpdate }: VideoProps) {
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [played, setPlayed] = useState(0);

  const playerRef = useRef<HTMLVideoElement | null>(null);

  const handleFullscreen = () => {
    const playerElement = document.getElementById('video-player-wrapper');
    if (playerElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsVideoFullscreen(false);
      } else {
        playerElement.requestFullscreen();
        setIsVideoFullscreen(true);
      }
    }
  };

  const handleReady = () => {
    setLoading(false);
  };

  const handleTimeUpdate = async (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    const currentVideoTime = video.currentTime;
    const videoDuration = video.duration;

    // Update played progress
    if (videoDuration > 0) {
      const progress = currentVideoTime / videoDuration;
      setPlayed(progress);
      onPlayedPercentageUpdate?.(progress);
      // // Mark as complete when 90% watched
      // if (progress > 0.9 && !watched) {
      //   setWatched(true);
      //   await toggleComplete({ completed: true, withRefresh: false, withToast: true });
      // }
    }
  };

  return (
    <MediaPlayer
      dir="ltr"
      className={`${!isVideoFullscreen && 'group relative mb-6 aspect-video overflow-hidden rounded-2xl bg-black'}`}
      id="video-player-wrapper"
      autoHide={true}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <Loader2 className="text-primary h-12 w-12 animate-spin" />
        </div>
      )}
      <MediaPlayerVideo
        className="outline-none"
        width="100%"
        height="100%"
        ref={playerRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleReady}
        onCanPlay={handleReady}
        onDoubleClick={handleFullscreen}
        autoPlay={true}>
        <source src={url} type="video/mp4" />
      </MediaPlayerVideo>
      <MediaPlayerControls className="flex-col items-start gap-2.5">
        <MediaPlayerControlsOverlay />
        <MediaPlayerSeek />
        <div className="flex w-full items-center gap-2">
          <div className="flex flex-1 items-center gap-2">
            <MediaPlayerPlay className="rounded-full! bg-none text-white! hover:bg-white/10" />
            <MediaPlayerSeekBackward className="rounded-full! bg-none text-white! hover:bg-white/10" />
            <MediaPlayerSeekForward className="rounded-full! bg-none text-white! hover:bg-white/10" />
            <MediaPlayerVolume expandable className="rounded-full! bg-none text-white! hover:bg-white/10" />
            <MediaPlayerTime className="text-md select-none" />
          </div>
          <div className="flex items-center gap-2">
            <MediaPlayerPlaybackSpeed className="text-md rounded-full! bg-none text-white! hover:bg-white/10" />
            <MediaPlayerPiP className="rounded-full! bg-none text-white! hover:bg-white/10" />
            <MediaPlayerFullscreen className="rounded-full! bg-none text-white! hover:bg-white/10" />
          </div>
        </div>
      </MediaPlayerControls>
    </MediaPlayer>
  );
}
