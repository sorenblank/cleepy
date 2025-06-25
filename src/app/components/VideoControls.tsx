/* eslint-disable */
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface VideoControlsProps {
    className?: string;
    totalDuration?: number; // in seconds
    currentTime?: number; // in seconds
    onTimeChange?: (time: number) => void;
    onRangeChange?: (leftTime: number, rightTime: number) => void;
    onExport?: (leftTime: number, rightTime: number) => void;
}

export default function VideoControls({
    className = '',
    totalDuration = 0,
    currentTime = 0,
    onTimeChange,
    onRangeChange,
    onExport: _onExport
}: VideoControlsProps) {
    const [leftRange, setLeftRange] = useState(0); // start of video
    const [rightRange, setRightRange] = useState(totalDuration); // end of video
    const [currentProgress, setCurrentProgress] = useState(currentTime);
    const [isDragging, setIsDragging] = useState<'left' | 'right' | 'progress' | null>(null);
    const [showLeftInput, setShowLeftInput] = useState(false);
    const [showRightInput, setShowRightInput] = useState(false);
    const [leftInputValue, setLeftInputValue] = useState('');
    const [rightInputValue, setRightInputValue] = useState('');

    const progressBarRef = useRef<HTMLDivElement>(null);

    // Format time in MM:SS format
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Parse time string (MM:SS) to seconds
    const parseTime = (timeStr: string): number => {
        const parts = timeStr.split(':');
        if (parts.length !== 2) return 0;
        const mins = parseInt(parts[0]) || 0;
        const secs = parseInt(parts[1]) || 0;
        return mins * 60 + secs;
    };

    // Get position percentage based on time
    const getPositionPercent = (time: number): number => {
        return (time / totalDuration) * 100;
    };

    // Get time from position percentage
    const getTimeFromPercent = (percent: number): number => {
        return (percent / 100) * totalDuration;
    };

    // Handle mouse/touch events for dragging
    const handleMouseDown = (type: 'left' | 'right' | 'progress') => (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(type);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !progressBarRef.current) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const time = getTimeFromPercent(percent);

        if (isDragging === 'left') {
            const newLeftRange = Math.max(0, Math.min(time, rightRange - 1));
            setLeftRange(newLeftRange);
            if (currentProgress < newLeftRange) {
                setCurrentProgress(newLeftRange);
                onTimeChange?.(newLeftRange);
            }
            onRangeChange?.(newLeftRange, rightRange);
        } else if (isDragging === 'right') {
            const newRightRange = Math.max(leftRange + 1, Math.min(time, totalDuration));
            setRightRange(newRightRange);
            if (currentProgress > newRightRange) {
                setCurrentProgress(newRightRange);
                onTimeChange?.(newRightRange);
            }
            onRangeChange?.(leftRange, newRightRange);
        } else if (isDragging === 'progress') {
            const newTime = Math.max(leftRange, Math.min(time, rightRange));
            setCurrentProgress(newTime);
            onTimeChange?.(newTime);
        }
    }, [isDragging, leftRange, rightRange, totalDuration, currentProgress, onTimeChange, onRangeChange]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(null);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Update current progress when currentTime prop changes
    useEffect(() => {
        setCurrentProgress(currentTime);
    }, [currentTime]);

    // Update right range when total duration changes
    useEffect(() => {
        setRightRange(totalDuration);
    }, [totalDuration]);

    // Handle custom time input for left range
    const handleLeftTimeSubmit = () => {
        const newTime = parseTime(leftInputValue);
        const clampedTime = Math.max(0, Math.min(newTime, rightRange - 1));
        setLeftRange(clampedTime);
        setShowLeftInput(false);
        onRangeChange?.(clampedTime, rightRange);
    };

    // Handle custom time input for right range
    const handleRightTimeSubmit = () => {
        const newTime = parseTime(rightInputValue);
        const clampedTime = Math.max(leftRange + 1, Math.min(newTime, totalDuration));
        setRightRange(clampedTime);
        setShowRightInput(false);
        onRangeChange?.(leftRange, clampedTime);
    };

    // const handleExport = () => {
    //     onExport?.(leftRange, rightRange);
    // };

    return (
        <div className={`flex flex-row items-center gap-[2px] w-full ${className}`}>
            {/* Left time button */}
            <div className="relative">
                {showLeftInput ? (
                    <input
                        type="text"
                        value={leftInputValue}
                        onChange={(e) => setLeftInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLeftTimeSubmit()}
                        onBlur={handleLeftTimeSubmit}
                        className="w-14 h-8 text-center text-white text-sm font-medium bg-red-600 rounded-tl-[90px] rounded-tr-2xl rounded-bl-[90px] rounded-br-2xl border-none outline-none"
                        autoFocus
                    />
                ) : (
                    <button
                        onClick={() => {
                            setLeftInputValue(formatTime(leftRange));
                            setShowLeftInput(true);
                        }}
                        className="w-14 h-8 bg-red-600 rounded-tl-[90px] rounded-tr-2xl rounded-bl-[90px] rounded-br-2xl flex items-center justify-center hover:bg-red-700 transition-colors"
                    >
                        <p className="text-white text-sm font-medium leading-[8px]">
                            {formatTime(leftRange)}
                        </p>
                    </button>
                )}
            </div>

            {/* Progress bar container */}
            <div
                ref={progressBarRef}
                className="w-full h-8 rounded bg-gray-200 flex flex-row items-center justify-center px-[6px]"
            >
                <div ref={progressBarRef}
                    className='w-full h-full rounded flex flex-row items-center justify-center relative cursor-pointer'>
                    {/* Background track */}
                    <div className="w-full h-[4px] bg-stone-500 rounded-full" />

                    {/* Selected range background */}
                    <div
                        className="h-[4px] bg-blue-600 rounded-full absolute"
                        style={{
                            left: `calc(${(getPositionPercent(leftRange) * (100 - 1.4)) / 100}%)`,
                            width: `calc(${((getPositionPercent(rightRange) - getPositionPercent(leftRange)) * (100 - 1.4)) / 100}%)`
                        }}
                    />

                    {/* Current progress indicator */}
                    <div
                        className="w-[8px] h-[18px] rounded-full absolute bg-red-600 cursor-grab active:cursor-grabbing"
                        style={{
                            left: `calc(${(getPositionPercent(currentProgress) * (100 - 1.4)) / 100}%)`
                        }}
                        onMouseDown={handleMouseDown('progress')}
                    />

                    {/* Left range selector */}
                    <div
                        className="w-[8px] h-[18px] rounded-full absolute bg-blue-600 cursor-grab active:cursor-grabbing"
                        style={{
                            left: `calc(${(getPositionPercent(leftRange) * (100 - 1.4)) / 100}%)`
                        }}
                        onMouseDown={handleMouseDown('left')}
                    />

                    {/* Left range timestamp */}
                    <div
                        className="w-min px-1 h-[20px] rounded-full absolute bg-blue-600 flex items-center justify-center"
                        style={{
                            left: `calc(${(getPositionPercent(leftRange) * (100 - 1.4)) / 100}% - 12px)`,
                            top: '-14px'
                        }}
                    >
                        <p className="text-white text-xs font-medium leading-[8px] whitespace-nowrap">
                            {formatTime(leftRange)}
                        </p>
                    </div>

                    {/* Right range selector */}
                    <div
                        className="w-[8px] h-[18px] rounded-full absolute bg-blue-600 cursor-grab active:cursor-grabbing z-40"
                        style={{
                            left: `calc(${(getPositionPercent(rightRange) * (100 - 1.4)) / 100}%)`
                        }}
                        onMouseDown={handleMouseDown('right')}
                    />

                    {/* Right range timestamp */}
                    <div
                        className="w-min px-1 h-[20px] rounded-full absolute bg-blue-600 flex items-center justify-center z-40"
                        style={{
                            left: `calc(${(getPositionPercent(rightRange) * (100 - 1.4)) / 100}% - 12px)`,
                            top: '-14px'
                        }}
                    >
                        <p className="text-white text-xs font-medium leading-[8px] whitespace-nowrap">
                            {formatTime(rightRange)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right time button */}
            <div className="relative z-10">
                {showRightInput ? (
                    <input
                        type="text"
                        value={rightInputValue}
                        onChange={(e) => setRightInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleRightTimeSubmit()}
                        onBlur={handleRightTimeSubmit}
                        className="w-14 h-8 text-center text-white text-sm font-medium bg-red-600 rounded-tl-2xl rounded-tr-[90px] rounded-bl-2xl rounded-br-[90px] border-none outline-none"
                        autoFocus
                    />
                ) : (
                    <button
                        onClick={() => {
                            setRightInputValue(formatTime(rightRange));
                            setShowRightInput(true);
                        }}
                        className="w-14 h-8 bg-red-600 rounded-tl-2xl rounded-tr-[90px] rounded-bl-2xl rounded-br-[90px] flex items-center justify-center hover:bg-red-700 transition-colors"
                    >
                        <p className="text-white text-sm font-medium leading-[8px]">
                            {formatTime(rightRange)}
                        </p>
                    </button>
                )}
            </div>
        </div>
    );
} 