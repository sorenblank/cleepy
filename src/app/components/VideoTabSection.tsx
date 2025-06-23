'use client';

import { useState } from 'react';
import ReactPlayer from 'react-player/youtube';

interface VideoTabSectionProps {
    onSearchStart: () => void;
    onLoadingComplete: () => void;
    onClose: () => void;
}

export default function VideoTabSection({ onSearchStart, onLoadingComplete, onClose }: VideoTabSectionProps) {
    const [inputValue, setInputValue] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [showPlaceholder, setShowPlaceholder] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const handlePlayerError = (error: any) => {
        console.error('Player error:', error);
        setError('Failed to load video. Please check the URL and try again.');
    };

    const handleClose = () => {
        // Reset all internal states to default
        setInputValue('');
        setVideoUrl('');
        setShowPlaceholder(true);
        setError(null);
        // Notify parent to hide controls
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
                            className='w-11 h-11 bg-red-600 rounded-tl-lg rounded-tr-[20px] rounded-bl-lg rounded-br-[20px] flex items-center justify-center hover:bg-red-700 transition-all duration-100 ease-in-out'
                        >
                            <img src="/search.svg" alt="search" className="w-6 h-6 origin-center" />
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
                    <ReactPlayer
                        url={videoUrl}
                        playing={false}
                        controls={true}
                        onReady={handlePlayerReady}
                        onStart={handlePlayerStart}
                        onError={handlePlayerError}
                        width="100%"
                        height="100%"
                    // config={{
                    //     youtube: {
                    //         playerVars: {
                    //             showinfo: 1,
                    //             controls: 1,
                    //         }
                    //     }
                    // }}
                    />

                    {/* close button */}
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-xl absolute top-4 right-4 hover:bg-red-600/20 transition-all duration-100 ease-in-out flex items-center justify-center z-10"
                    >
                        <img src="/x.svg" alt="close" className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
} 