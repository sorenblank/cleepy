'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactPlayer from 'react-player/youtube';

interface VideoTabSectionProps {
    onSearchStart: () => void;
    onLoadingComplete: () => void;
    onClose: () => void;
    onPlayStateChange?: (isPlaying: boolean) => void;
    onProgress?: (currentTime: number, duration: number) => void;
}

export interface VideoTabSectionRef {
    play: () => void;
    pause: () => void;
    seekTo: (seconds: number) => void;
    getCurrentVideoUrl: () => string;
    getCurrentVideoTitle: () => string;
}

const VideoTabSection = forwardRef<VideoTabSectionRef, VideoTabSectionProps>(
    (
        {
            onSearchStart,
            onLoadingComplete,
            onClose,
            onPlayStateChange,
            onProgress,
        },
        ref,
    ) => {
        const [inputValue, setInputValue] = useState('');
        const [videoUrl, setVideoUrl] = useState('');
        const [showPlaceholder, setShowPlaceholder] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const [isPlaying, setIsPlaying] = useState(true);

        const playerRef = useRef<ReactPlayer>(null);

        useImperativeHandle(ref, () => ({
            play: () => {
                if (playerRef.current) {
                    setIsPlaying(true);
                    onPlayStateChange?.(true);
                }
            },
            pause: () => {
                if (playerRef.current) {
                    setIsPlaying(false);
                    onPlayStateChange?.(false);
                }
            },
            seekTo: (seconds: number) => {
                if (playerRef.current) {
                    playerRef.current.seekTo(seconds);
                }
            },
            getCurrentVideoUrl: () => {
                return videoUrl;
            },
            getCurrentVideoTitle: () => {
                // Extract title from YouTube URL or return a default
                try {
                    const url = new URL(videoUrl);
                    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
                        // For now, return a simple title, could be enhanced to fetch actual title
                        return 'YouTube Video';
                    }
                    return 'Video';
                } catch {
                    return 'Video';
                }
            },
        }));

        const handleSearch = () => {
            if (!inputValue.trim()) return;

            setShowPlaceholder(false);
            setError(null);
            onSearchStart();
            setVideoUrl(inputValue);
        };

        const handlePlayerReady = () => {
            console.log('Player ready');
            onLoadingComplete();
        };

        const handlePlayerStart = () => {
            console.log('Player started');
            onLoadingComplete();
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handlePlayerError = (error: any) => {
            console.error('Player error:', error);
            setError('Failed to load video. Please check the URL and try again.');
        };

        const handleProgress = (state: {
            played: number;
            playedSeconds: number;
            loaded: number;
            loadedSeconds: number;
        }) => {
            if (playerRef.current) {
                const duration = playerRef.current.getDuration();
                onProgress?.(state.playedSeconds, duration);
            }
        };

        const handleClose = () => {
            setInputValue('');
            setVideoUrl('');
            setShowPlaceholder(true);
            setError(null);
            setIsPlaying(false);
            onClose();
        };

        const handleKeyPress = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        };

        return (
            <div className="w-[860px] h-[484px] bg-gray-200 rounded-[30px] border border-stone-500/20 z-50 overflow-hidden">
                {showPlaceholder ? (
                    /* search state before any video is loaded */
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <div className="flex flex-row items-center justify-center gap-1">
                            <div className="w-52 h-11 bg-white rounded-tl-[20px] rounded-tr-lg rounded-bl-[20px] rounded-br-lg flex items-center justify-left">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="https://youtube.com/......."
                                    className="w-full h-full px-4 bg-transparent text-zinc-500 text-sm font-semibold leading-none outline-none placeholder-zinc-500"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="w-11 h-11 bg-red-600 rounded-tl-lg rounded-tr-[20px] rounded-bl-lg rounded-br-[20px] flex items-center justify-center hover:bg-red-700 transition-all duration-100 ease-in-out"
                            >
                                <img
                                    src="/search.svg"
                                    alt="search"
                                    className="w-6 h-6 origin-center"
                                />
                            </button>
                        </div>
                        {error && (
                            <div className="text-red-600 text-sm font-medium max-w-md text-center">
                                {error}
                            </div>
                        )}
                    </div>
                ) : (
                    /* video loaded state */
                    <div className="w-full h-full flex items-center justify-center relative">
                        {/* This wrapper is the key. It crops the oversized player. */}
                        <div className="w-full h-full absolute top-0 left-0 overflow-hidden">
                            <ReactPlayer
                                ref={playerRef}
                                url={videoUrl}
                                playing={isPlaying}
                                onReady={handlePlayerReady}
                                onStart={handlePlayerStart}
                                onError={handlePlayerError}
                                onProgress={handleProgress}
                                width="100%"
                                // Make the player taller than the container
                                height="calc(100% + 400px)"
                                style={{
                                    // Position it to hide the top and bottom bars
                                    position: 'absolute',
                                    top: '-200px',
                                    left: '0',
                                }}
                            // config={{
                            //     youtube: {
                            //         playerVars: {
                            //             // Hides the player controls.
                            //             controls: 0,
                            //             // Shows related videos from the same channel.
                            //             rel: 0,
                            //             // Disables video annotations.
                            //             iv_load_policy: 3,
                            //             // The following are deprecated but don't hurt to have.
                            //             showinfo: 0,
                            //             modestbranding: 1,
                            //         },
                            //     },
                            // }}
                            />
                        </div>

                        {/* Your transparent overlay to capture custom controls/events */}
                        <div className="w-full h-full absolute top-0 left-0 bg-transparent z-10"></div>

                        {/* close button */}
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 rounded-xl absolute top-4 right-4 hover:bg-red-600/20 transition-all duration-100 ease-in-out flex items-center justify-center z-20"
                        >
                            <img src="/x.svg" alt="close" className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </div>
        );
    },
);

VideoTabSection.displayName = 'VideoTabSection';

export default VideoTabSection;