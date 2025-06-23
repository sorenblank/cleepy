'use client';

import { useState } from 'react';
import PlayPauseButton from './PlayPauseButton';
import VideoControls from './VideoControls';

interface ControlsSectionProps {
    className?: string;
    isVideoLoaded?: boolean;
    totalDuration?: number; // in seconds
    currentTime?: number; // in seconds
    onTimeChange?: (time: number) => void;
    onRangeChange?: (leftTime: number, rightTime: number) => void;
    onPlayStateChange?: (isPlaying: boolean) => void;
    onExport?: (leftTime: number, rightTime: number) => void;
}

export default function ControlsSection({
    className = '',
    isVideoLoaded = true,
    totalDuration = 580, // default 9:40 (9 minutes 40 seconds)
    currentTime = 0,
    onTimeChange,
    onRangeChange,
    onPlayStateChange,
    onExport
}: ControlsSectionProps) {
    const [leftTime, setLeftTime] = useState(60); // 1 minute
    const [rightTime, setRightTime] = useState(480); // 8 minutes

    const handleRangeChange = (left: number, right: number) => {
        setLeftTime(left);
        setRightTime(right);
        onRangeChange?.(left, right);
    };

    const handleExport = () => {
        onExport?.(leftTime, rightTime);
        // You can add export logic here or keep it in the parent component
    };

    return (
        <div className={`w-[860px] ${isVideoLoaded ? 'mt-6' : 'mt-[-60px]'} ${isVideoLoaded ? 'blur-none scale-100' : 'blur-xl scale-80'} flex flex-row items-center z-40 transition-all duration-150 ease-in-out ${className}`}>
            {/* Play Pause Button */}
            <PlayPauseButton onStateChange={onPlayStateChange} />

            {/* divider */}
            <div className="flex items-center justify-center px-1">
                <div className="w-[1px] h-[16px] bg-stone-500/60 rounded-full" />
            </div>

            {/* Video Controls (progress bar and range selector) */}
            <VideoControls
                totalDuration={totalDuration}
                currentTime={currentTime}
                onTimeChange={onTimeChange}
                onRangeChange={handleRangeChange}
                onExport={handleExport}
            />

            {/* divider */}
            <div className="flex items-center justify-center px-1">
                <div className="w-[1px] h-[16px] bg-stone-500/60 rounded-full" />
            </div>

            {/* export button */}
            <button
                className="w-28 h-8 bg-amber-300 rounded-2xl flex items-center justify-center gap-1 hover:bg-amber-400 transition-all duration-100 ease-in-out"
                onClick={handleExport}
            >
                <img src="/export.svg" alt="export" className="w-4 h-4 origin-center" />
                <p className="text-white font-semibold text-xs">Export</p>
            </button>
        </div>
    );
} 