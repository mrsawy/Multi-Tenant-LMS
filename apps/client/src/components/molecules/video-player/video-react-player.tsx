import React, { useRef, useState, useCallback } from 'react';
// @ts-ignore - react-player types can be inconsistent
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, Gauge } from 'lucide-react';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

type VideoReactPlayerProps = {
    url: string;
    toggleComplete: (args: { completed: boolean; withToast: boolean; withRefresh: boolean }) => Promise<void>;
    played: number;
    setPlayed: React.Dispatch<React.SetStateAction<number>>;
    watched: boolean;
    setWatched: React.Dispatch<React.SetStateAction<boolean>>;
    isUploadedVideo: boolean;
    playerRef: React.RefObject<any>;
    playing: boolean;
    setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    volume: number;
    setVolume: React.Dispatch<React.SetStateAction<number>>;
    muted: boolean;
    setMuted: React.Dispatch<React.SetStateAction<boolean>>;
    playbackRate: number;
    setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
    duration: number;
    setDuration: React.Dispatch<React.SetStateAction<number>>;
    showSpeedMenu: boolean;
    setShowSpeedMenu: React.Dispatch<React.SetStateAction<boolean>>;
    handleTimeChange: (e: any) => void;
    handleDuration: (duration: number) => void;
    handleReady: () => void;
    handleSeekMouseDown: () => void;
    handleSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSeekMouseUp: () => void;
    handlePlayPause: () => void;
    handleVolumeToggle: () => void;
    handleSpeedChange: (speed: number) => void;
    handleFullscreen: () => void;
    formatTime: (seconds: number) => string;
};

const VideoReactPlayer: React.FC<VideoReactPlayerProps> = ({
    url,
    toggleComplete,
    played,
    setPlayed,
    watched,
    setWatched,
    isUploadedVideo,
    playerRef,
    playing,
    setPlaying,
    volume,
    setVolume,
    muted,
    setMuted,
    playbackRate,
    setPlaybackRate,
    duration,
    setDuration,
    showSpeedMenu,
    setShowSpeedMenu,
    handleTimeChange,
    handleDuration,
    handleReady,
    handleSeekMouseDown,
    handleSeekChange,
    handleSeekMouseUp,
    handlePlayPause,
    handleVolumeToggle,
    handleSpeedChange,
    handleFullscreen,
    formatTime,
}) => {


    if (!url) {
        return (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No video URL provided</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* @ts-ignore - react-player types can be inconsistent */}
            <ReactPlayer
                ref={playerRef}
                // @ts-ignore
                url={url}
                width="100%"
                height="100%"
                playing={playing}
                volume={volume}
                muted={muted}
                onProgress={handleTimeChange}
                playbackRate={playbackRate}
                onDuration={handleDuration}
                onReady={handleReady}
                controls={false}
            />

            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
        </>
    );
};

export default VideoReactPlayer;