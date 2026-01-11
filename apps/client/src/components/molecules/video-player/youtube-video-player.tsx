import React, { ReactEventHandler, useCallback, useEffect, useRef, useState } from 'react';
// @ts-ignore - react-player types can be inconsistent
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Gauge, Loader2 } from 'lucide-react';
import { formatTime } from '@/lib/utils/video';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

type YoutubeVideoPlayerProps = {
    url: string;
    onPlayedPercentageUpdate?: (time: number) => void;

};

function YoutubeVideoPlayer({
    onPlayedPercentageUpdate,
    url,

}: YoutubeVideoPlayerProps) {
    const [playing, setPlaying] = useState(false)
    const [volume, setVolume] = useState(0.8)
    const [muted, setMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [duration, setDuration] = useState(0)
    const [playedPercentage, setPlayedPercentage] = useState(0)
    const [loading, setLoading] = useState(true)
    const [seeking, setSeeking] = useState(false)
    const [showSpeedMenu, setShowSpeedMenu] = useState(false)

    const playerRef = useRef<any>(null);
    const reactPlayerInstanceRef = useRef<any>(null);

    // Sync playbackRate changes to the player
    useEffect(() => {
        if (playbackRate) {
            // Find the youtube-video custom element
            const youtubeVideoElement = document.querySelector('youtube-video') as any;

            if (youtubeVideoElement && 'playbackRate' in youtubeVideoElement) {
                try {
                    youtubeVideoElement.playbackRate = playbackRate;
                    return;
                } catch (err) {
                    // Silent fail
                }
            }

            // Try ReactPlayer instance
            if (reactPlayerInstanceRef.current) {
                const player = reactPlayerInstanceRef.current;

                if (typeof player.getInternalPlayer === 'function') {
                    try {
                        const internalPlayer = player.getInternalPlayer();
                        if (internalPlayer && typeof internalPlayer.setPlaybackRate === 'function') {
                            internalPlayer.setPlaybackRate(playbackRate);
                            return;
                        }
                    } catch (err) {
                        // Silent fail
                    }
                }

                if ('playbackRate' in player) {
                    try {
                        (player as any).playbackRate = playbackRate;
                    } catch (err) {
                        // Silent fail
                    }
                }
            }

            // Try the ref
            if (playerRef.current && 'playbackRate' in playerRef.current) {
                try {
                    (playerRef.current as any).playbackRate = playbackRate;
                } catch (err) {
                    // Silent fail
                }
            }
        }
    }, [playbackRate]);



    const handleProgress: React.ReactEventHandler<HTMLVideoElement> = useCallback((event) => {
        const currentTime = event.currentTarget.currentTime;
        const duration = event.currentTarget.duration;
        console.log({ currentTime, duration, seeking })
        const percentage = currentTime / duration
        if (duration > 0 && !seeking) {
            setPlayedPercentage(percentage);
            onPlayedPercentageUpdate?.(percentage);
        }

    }, [seeking]);

    const handleReady = () => {
        setLoading(false)
    }





    const handlePlayPause = () => {
        console.log({ playing })
        setPlaying(!playing)
    }
    const handleSpeedChange = (speed: number) => {
        console.log('handleSpeedChange', speed)
        setPlaybackRate(speed);
        setShowSpeedMenu(false);

        const youtubeVideoElement = document.querySelector('youtube-video') as any;

        if (youtubeVideoElement && youtubeVideoElement.api) {
            const api = youtubeVideoElement.api;

            // Check available playback rates first
            if (typeof api.getAvailablePlaybackRates === 'function') {
                try {
                    const availableRates = api.getAvailablePlaybackRates();
                    console.log('Available playback rates:', availableRates);

                    // YouTube might only support specific rates, round to nearest available
                    if (Array.isArray(availableRates) && availableRates.length > 0) {
                        // Find closest available rate
                        const closestRate = availableRates.reduce((prev, curr) =>
                            Math.abs(curr - speed) < Math.abs(prev - speed) ? curr : prev
                        );
                        console.log('Using closest available rate:', closestRate);
                        speed = closestRate;
                    }
                } catch (err) {
                    console.error('getAvailablePlaybackRates error:', err);
                }
            }

            // Ensure video is playing before setting playback rate
            if (typeof api.getPlayerState === 'function') {
                const state = api.getPlayerState();
                console.log('Player state:', state);
                // State 1 = playing, 2 = paused, 3 = buffering
                // If paused, we might need to play first or set rate differently
            }

            // Try setPlaybackRate with a delay to ensure player is ready
            if (typeof api.setPlaybackRate === 'function') {
                setTimeout(() => {
                    try {
                        api.setPlaybackRate(speed);
                        console.log('✅ Called setPlaybackRate with:', speed);
                        const currentRate = api.getPlaybackRate();
                        console.log('Current playback rate:', currentRate);
                        // Wait a bit and verify
                        setTimeout(() => {
                            if (currentRate !== speed) {
                                console.log('Retrying setPlaybackRate...');
                                console.log({ api });
                                api.setPlaybackRate(speed);
                                console.log("playerRef.current", playerRef, playerRef.current);
                                playerRef.current.api.setPlaybackRate(speed);

                            }
                        }, 200);
                    } catch (err) {
                        console.error('setPlaybackRate error:', err);
                    }
                }, 50);
            }

            // Also try postMessage as backup
            try {
                const iframe = youtubeVideoElement.querySelector('iframe') ||
                    (youtubeVideoElement.shadowRoot && youtubeVideoElement.shadowRoot.querySelector('iframe'));

                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage(JSON.stringify({
                        event: 'command',
                        func: 'setPlaybackRate',
                        args: [speed]
                    }), '*');
                }
            } catch (err) {
                console.error('postMessage error:', err);
            }
        }
    }
    const handleVolumeToggle = () => {
        setMuted(!muted)
    }


    const handleDuration: ReactEventHandler<HTMLVideoElement> = (event) => {
        const duration = (event.target as HTMLVideoElement).duration;
        console.log({ duration })
        setDuration(duration);
    };

    const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        setSeeking(false);
        const seekValue = parseFloat((e.target as HTMLInputElement).value);

        if (duration > 0) {
            const seekTime = seekValue * duration; // Convert percentage to seconds

            // Try ReactPlayer instance first (captured via callback ref)
            if (reactPlayerInstanceRef.current) {
                const player = reactPlayerInstanceRef.current;
                if (typeof player.seekTo === 'function') {
                    try {
                        player.seekTo(seekTime, 'seconds');
                        return;
                    } catch (err) {
                        console.error('ReactPlayer seekTo error:', err);
                    }
                }
            }

            // Fallback: Try the ref (might be custom element)
            if (playerRef.current) {
                const player = playerRef.current;

                // Try ReactPlayer's seekTo
                if (typeof player.seekTo === 'function') {
                    try {
                        player.seekTo(seekTime, 'seconds');
                        return;
                    } catch (err) {
                        console.error('seekTo error:', err);
                    }
                }

                // Try getInternalPlayer
                if (typeof player.getInternalPlayer === 'function') {
                    try {
                        const internalPlayer = player.getInternalPlayer();
                        if (internalPlayer && typeof internalPlayer.seekTo === 'function') {
                            internalPlayer.seekTo(seekTime, true);
                            return;
                        }
                    } catch (err) {
                        console.error('getInternalPlayer error:', err);
                    }
                }

                // Try custom element's currentTime
                if ('currentTime' in player) {
                    try {
                        (player as any).currentTime = seekTime;
                        return;
                    } catch (err) {
                        console.error('currentTime error:', err);
                    }
                }
            }
        }
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

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayedPercentage(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
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

            <ReactPlayer
                ref={playerRef}
                src={url}
                width="100%"
                height="100%"
                playing={playing}
                volume={volume}
                muted={muted}
                playbackRate={playbackRate}
                onDurationChange={handleDuration}
                onReady={handleReady}
                controls={false}
                onTimeUpdate={handleProgress}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
            />

            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            {formatTime(duration * playedPercentage)} / {formatTime(duration)}
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

export default YoutubeVideoPlayer