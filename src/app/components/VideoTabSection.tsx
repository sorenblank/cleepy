'use client';

import { useState } from 'react';

interface VideoTabSectionProps {
    onSearchStart: () => void;
    onLoadingComplete: () => void;
    onClose: () => void;
}

export default function VideoTabSection({ onSearchStart, onLoadingComplete, onClose }: VideoTabSectionProps) {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPlaceholder, setShowPlaceholder] = useState(true);

    const handleSearch = () => {
        if (!inputValue.trim()) return;

        setIsLoading(true);
        setShowPlaceholder(false);
        onSearchStart();

        // Simulate loading time
        setTimeout(() => {
            setIsLoading(false);
            onLoadingComplete();
        }, 0); // 2 second loading time
    };

    const handleClose = () => {
        // Reset all internal states to default
        setInputValue('');
        setIsLoading(false);
        setShowPlaceholder(true);
        // Notify parent to hide controls
        onClose();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="w-[860px] h-[484px] bg-gray-200 rounded-[30px] border border-stone-500/20 z-50">
            {showPlaceholder && !isLoading ? (
                /* search state before any video is loaded */
                <div className="w-full h-full flex flex-row items-center justify-center gap-1">
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
            ) : isLoading ? (
                /* loading state */
                <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                </div>
            ) : (
                /* video loaded state - placeholder for now */
                <div className="w-full h-full flex items-center justify-center relative">
                    <div className="text-zinc-600 text-lg font-medium">
                        Video Player Area
                    </div>

                    {/* close button */}
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-xl absolute top-4 right-4 hover:bg-red-600/20 transition-all duration-100 ease-in-out flex items-center justify-center"
                    >
                        <img src="/x.svg" alt="close" className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
} 