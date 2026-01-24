import React, { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeProps, YouTubeEvent } from 'react-youtube';
import { Play, Pause, Volume2, VolumeX, Maximize, Gauge, Loader2 } from 'lucide-react';
import { formatTime } from '@/lib/utils/video';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

type ReactYoutubePlayerProps = {
    url: string;
    onPlayedPercentageUpdate?: (time: number) => void;
};

// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

function ReactYoutubePlayer({
    url,
    onPlayedPercentageUpdate,
}: ReactYoutubePlayerProps) {
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [playedPercentage, setPlayedPercentage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [seeking, setSeeking] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const playerRef = useRef<any>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const videoId = getYouTubeVideoId(url);

    // Update current time periodically and track progress
    useEffect(() => {
        if (isReady && playerRef.current) {
            const updateTime = () => {
                if (playerRef.current && !seeking) {
                    try {
                        const time = playerRef.current.getCurrentTime();
                        if (typeof time === 'number' && !isNaN(time) && time >= 0) {
                            setCurrentTime(time);

                            // Calculate and update played percentage
                            if (duration > 0) {
                                const percentage = time / duration;
                                setPlayedPercentage(percentage);
                                onPlayedPercentageUpdate?.(percentage);
                            }
                        }
                    } catch (err) {
                        // Silent fail
                    }
                }
            };

            // Update immediately
            updateTime();

            // Then update periodically
            intervalRef.current = setInterval(updateTime, 250);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isReady, seeking, duration, onPlayedPercentageUpdate]);

    const handleReady: YouTubeProps['onReady'] = (event: YouTubeEvent<any>) => {
        playerRef.current = event.target;
        setIsReady(true);
        setLoading(false);

        // Get initial duration - might need to wait a bit
        const getDuration = () => {
            try {
                const dur = event.target.getDuration();
                if (dur && dur > 0) {
                    setDuration(dur);
                } else {
                    // Retry after a short delay if duration not available yet
                    setTimeout(getDuration, 500);
                }
            } catch (err) {
                // Retry after a short delay
                setTimeout(getDuration, 500);
            }
        };
        getDuration();

        // Set initial volume (convert from 0-1 to 0-100 for YouTube API)
        try {
            event.target.setVolume(volume * 100);
            if (muted) {
                event.target.mute();
            }
        } catch (err) {
            // Silent fail
        }
    };

    const handleStateChange: YouTubeProps['onStateChange'] = (event: YouTubeEvent<any>) => {
        // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
        const state = event.data;
        if (state === 1) {
            setPlaying(true);
            setLoading(false);
        } else if (state === 2 || state === 0) {
            setPlaying(false);
            setLoading(false);
        } else if (state === 3) {
            // Only show loading if we're actually buffering during playback
            if (isReady) {
                setLoading(true);
            }
        } else if (state === -1 || state === 5) {
            setLoading(false);
        }
    };

    const handlePlayPause = () => {
        if (!playerRef.current) return;

        try {
            if (playing) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        } catch (err) {
            console.error('Play/pause error:', err);
        }
    };

    const handleSpeedChange = (speed: number) => {
        setPlaybackRate(speed);
        setShowSpeedMenu(false);

        if (!playerRef.current || !isReady) return;

        // YouTube requires video to be playing or at least loaded to change playback rate
        const applyPlaybackRate = () => {
            try {
                // Get available playback rates
                const availableRates = playerRef.current.getAvailablePlaybackRates();

                if (Array.isArray(availableRates) && availableRates.length > 0) {
                    // Find closest available rate
                    const closestRate = availableRates.reduce((prev, curr) =>
                        Math.abs(curr - speed) < Math.abs(prev - speed) ? curr : prev
                    );
                    playerRef.current.setPlaybackRate(closestRate);
                    setPlaybackRate(closestRate);
                } else {
                    playerRef.current.setPlaybackRate(speed);
                }
            } catch (err) {
                console.error('setPlaybackRate error:', err);
                // Retry after a short delay
                setTimeout(applyPlaybackRate, 100);
            }
        };

        // If video is not playing, we might need to ensure it's ready
        const playerState = playerRef.current.getPlayerState();
        if (playerState === -1 || playerState === 5) {
            // Video not started yet, wait for it to be ready
            setTimeout(applyPlaybackRate, 200);
        } else {
            applyPlaybackRate();
        }
    };

    const handleVolumeToggle = () => {
        if (!playerRef.current) return;

        try {
            if (muted) {
                playerRef.current.unMute();
                setMuted(false);
            } else {
                playerRef.current.mute();
                setMuted(true);
            }
        } catch (err) {
            console.error('Volume toggle error:', err);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);

        // Automatically mute/unmute based on volume
        if (newVolume === 0) {
            setMuted(true);
        } else {
            setMuted(false);
        }

        if (!playerRef.current) return;

        try {
            // YouTube API expects 0-100, but we store 0-1
            playerRef.current.setVolume(newVolume * 100);
            if (newVolume === 0) {
                playerRef.current.mute();
            } else {
                playerRef.current.unMute();
            }
        } catch (err) {
            console.error('Volume change error:', err);
        }
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const percentage = parseFloat(e.target.value);
        setPlayedPercentage(percentage);
        if (duration > 0) {
            setCurrentTime(percentage * duration);
        }
    };

    const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        const seekValue = parseFloat((e.target as HTMLInputElement).value);

        if (duration > 0 && playerRef.current) {
            const seekTime = seekValue * duration;

            try {
                playerRef.current.seekTo(seekTime, true);
                // Update current time immediately
                setCurrentTime(seekTime);
            } catch (err) {
                console.error('Seek error:', err);
            }
        }

        // Reset seeking state after a short delay to allow seek to complete
        setTimeout(() => {
            setSeeking(false);
        }, 100);
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

    // Sync volume changes
    useEffect(() => {
        if (playerRef.current && !muted && isReady) {
            try {
                // YouTube API expects 0-100, but we store 0-1
                playerRef.current.setVolume(volume * 100);
            } catch (err) {
                // Silent fail
            }
        }
    }, [volume, muted, isReady]);

    // Sync playback rate changes
    useEffect(() => {
        if (playerRef.current && playbackRate && isReady) {
            try {
                const availableRates = playerRef.current.getAvailablePlaybackRates();
                if (Array.isArray(availableRates) && availableRates.length > 0) {
                    const closestRate = availableRates.reduce((prev, curr) =>
                        Math.abs(curr - playbackRate) < Math.abs(prev - playbackRate) ? curr : prev
                    );
                    playerRef.current.setPlaybackRate(closestRate);
                } else {
                    playerRef.current.setPlaybackRate(playbackRate);
                }
            } catch (err) {
                // Silent fail
            }
        }
    }, [playbackRate, isReady]);

    if (!videoId) {
        return (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6 flex items-center justify-center">
                <p className="text-white">Invalid YouTube URL</p>
            </div>
        );
    }

    const opts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
        },
    };

    return (
        <div
            className="relative aspect-video bg-black rounded-lg overflow-hidden mb-6 group"
        >
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
            )}

            <div className="absolute inset-0">
                <YouTube
                    videoId={videoId}
                    opts={opts}
                    onReady={handleReady}
                    onStateChange={handleStateChange}
                    className="w-full h-full"
                    iframeClassName="w-full h-full"
                />
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <input
                    type="range"
                    min={0}
                    max={0.999999}
                    step="any"
                    value={playedPercentage || 0}
                    onMouseDown={handleSeekMouseDown}
                    onChange={handleSeekChange}
                    onMouseUp={handleSeekMouseUp}
                    style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(playedPercentage || 0) * 100}%, #4b5563 ${(playedPercentage || 0) * 100}%, #4b5563 100%)`
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
                            {muted || volume === 0 ? (
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
                            onChange={handleVolumeChange}
                            style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(muted ? 0 : volume) * 100}%, #4b5563 ${(muted ? 0 : volume) * 100}%, #4b5563 100%)`
                            }}
                            className="w-20 h-1 rounded-lg appearance-none cursor-pointer"
                        />

                        <span className="text-white text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
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
    );
}

export default ReactYoutubePlayer;