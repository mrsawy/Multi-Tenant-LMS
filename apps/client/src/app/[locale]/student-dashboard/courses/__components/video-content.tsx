import React, { ReactEventHandler, use, useEffect, useState } from 'react';
// @ts-ignore - react-player types can be inconsistent
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, Gauge } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { VideoType } from '@/lib/types/course/enum/VideoType.enum';
import { IContent } from '@/lib/types/course/content.interface';
import { useRouter } from '@/i18n/navigation';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const VideoContent: React.FC<{
    content: IContent, isComplete: boolean,
    toggleComplete: (args: { completed: boolean, withToast: boolean, withRefresh: boolean }) => Promise<void>
}> = ({ toggleComplete, isComplete, content }) => {
    const [url, setUrl] = useState(content.videoUrl || "");
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [loading, setLoading] = useState(true);
    const [watched, setWatched] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [isUploadedVideo, setIsUploadedVideo] = useState(false);

    const playerRef = React.useRef<any>(null);
    const router = useRouter()

    useEffect(() => {
        if (content.videoType === VideoType.UPLOAD) {
            setUrl(content.fileKey ?? "");
            setIsUploadedVideo(true);
        } else {
            setUrl(content.videoUrl || "");
            setIsUploadedVideo(false);
        }
    }, [content.videoType, content.fileKey, content.videoUrl]);

    useEffect(() => {
        return () => { router.refresh() }
    }, [])


    const handlePlayPause = () => {
        setPlaying(!playing);
    };

    const handleVolumeToggle = () => {
        setMuted(!muted);
    };

    const handleTimeChange = async (event: any) => {

        const currentTime = event.target.currentTime
        console.log({ currentTime })
        if (!seeking) {
            setPlayed(currentTime / duration);
        }

        if ((currentTime / duration) > 0.9 && !watched) {
            setWatched(true);
            await toggleComplete({ completed: true, withRefresh: false, withToast: true })
        }
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        setSeeking(false);
        const seekValue = parseFloat((e.target as HTMLInputElement).value);
        if (playerRef.current) {
            const videoElement = playerRef.current as HTMLVideoElement;
            if (videoElement.duration) {
                videoElement.currentTime = seekValue * videoElement.duration;
            }
        }
    };

    const handleDuration: ReactEventHandler<HTMLVideoElement> = (event) => {
        const duration = (event.target as HTMLVideoElement).duration;
        setDuration(duration);
    };

    const handleReady = () => {
        setLoading(false);
    };

    const handleFullscreen = () => {
        const playerElement = document.getElementById('video-player-wrapper');
        if (playerElement) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                playerElement.requestFullscreen();
            }
        }
    };

    const handleSpeedChange = (speed: number) => {
        setPlaybackRate(speed);
        setShowSpeedMenu(false);
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const date = new Date(seconds * 1000);
        const hh = date.getUTCHours();
        const mm = date.getUTCMinutes();
        const ss = date.getUTCSeconds().toString().padStart(2, '0');
        if (hh) {
            return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
        }
        return `${mm}:${ss}`;
    };


    if (!url) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                    <div className="text-center text-gray-500">
                        <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No video URL provided</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div
                id="video-player-wrapper"
                className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6 group"
                onClick={handlePlayPause}
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                    </div>
                )}

                {isUploadedVideo ? (
                    <ReactPlayer
                        ref={playerRef}
                        src={url}
                        width="100%"
                        height="100%"
                        playing={playing}
                        volume={volume}
                        muted={muted}
                        onTimeUpdate={handleTimeChange}
                        playbackRate={playbackRate}
                        onDurationChange={handleDuration}
                        onReady={handleReady}
                        controls={false}
                    />
                ) : (
                    <ReactPlayer
                        ref={playerRef}
                        src={url}
                        width="100%"
                        height="100%"
                        playing={playing}
                        volume={volume}
                        muted={muted}
                        onTimeUpdate={handleTimeChange}
                        playbackRate={playbackRate}
                        // onProgress={handleProgress}
                        onDurationChange={handleDuration}
                        onReady={handleReady}
                        controls={false}
                    />
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input
                        type="range"
                        min={0}
                        max={0.999999}
                        step="any"
                        value={played || 0}
                        onMouseDown={handleSeekMouseDown}
                        onChange={handleSeekChange}
                        onMouseUp={handleSeekMouseUp}
                        style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(played || 0) * 100}%, #4b5563 ${(played || 0) * 100}%, #4b5563 100%)`
                        }}
                        className="w-full h-1 mb-3 rounded-lg appearance-none cursor-pointer"
                    />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePlayPause}
                                className="text-white hover:text-blue-400 transition-colors"
                            >
                                {playing ? (
                                    <Pause className="w-6 h-6" />
                                ) : (
                                    <Play className="w-6 h-6" />
                                )}
                            </button>

                            <button
                                onClick={handleVolumeToggle}
                                className="text-white hover:text-blue-400 transition-colors"
                            >
                                {muted ? (
                                    <VolumeX className="w-5 h-5" />
                                ) : (
                                    <Volume2 className="w-5 h-5" />
                                )}
                            </button>

                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={muted ? 0 : volume}
                                onChange={(e) => {
                                    setVolume(parseFloat(e.target.value));
                                    setMuted(false);
                                }}
                                style={{
                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(muted ? 0 : volume) * 100}%, #4b5563 ${(muted ? 0 : volume) * 100}%, #4b5563 100%)`
                                }}
                                className="w-20 h-1 rounded-lg appearance-none cursor-pointer"
                            />

                            <span className="text-white text-sm">
                                {formatTime(duration * played)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Speed Control */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                    className="text-white hover:text-blue-400 transition-colors flex items-center gap-1"
                                >
                                    <Gauge className="w-5 h-5" />
                                    <span className="text-sm">{playbackRate}x</span>
                                </button>

                                {showSpeedMenu && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-lg py-1 min-w-[80px]">
                                        {PLAYBACK_SPEEDS.map((speed) => (
                                            <button
                                                key={speed}
                                                onClick={() => handleSpeedChange(speed)}
                                                className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-800 transition-colors ${speed === playbackRate ? 'text-blue-400' : 'text-white'
                                                    }`}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleFullscreen}
                                className="text-white hover:text-blue-400 transition-colors"
                            >
                                <Maximize className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center space-y-4">
                {content.title && (
                    <h3 className="text-xl font-semibold">{content.title}</h3>
                )}

                <div className="flex items-center justify-center gap-2">
                    <div className="text-sm text-gray-600">
                        Progress: {Math.round(played * 100)}%
                    </div>
                    {watched && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            ✓ Watched
                        </span>
                    )}
                </div>

                <Button
                    size="lg"
                    disabled={watched}
                    className={watched ? 'bg-green-600 hover:bg-green-600' : ''}
                >
                    {watched ? '✓  Watched' : 'Complete up to 90% to mark as completed'}
                </Button>
            </div>
        </div>
    );
};

export default VideoContent;