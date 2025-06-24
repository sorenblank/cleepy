'use client';

interface PlayPauseButtonProps {
    className?: string;
    isPlaying?: boolean;
    onStateChange?: (isPlaying: boolean) => void;
}

export default function PlayPauseButton({
    className = '',
    isPlaying = true,
    onStateChange
}: PlayPauseButtonProps) {
    const handleClick = () => {
        const newState = !isPlaying;
        onStateChange?.(newState);
    };

    return (
        <button
            onClick={handleClick}
            className={`w-20 h-8 rounded-2xl flex items-center justify-center  transition-all duration-150 ease-in-out relative overflow-hidden ${isPlaying ? 'bg-red-400 ' : 'bg-red-600 '} ${className}`}
        >
            {/* Play Icon */}
            <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-150 ease-in-out ${isPlaying
                    ? 'scale-75 blur-[1px] opacity-0'
                    : 'scale-100 blur-0 opacity-100'
                    }`}
            >
                <img src="/play.svg" alt="play" className="w-4 h-4" />
            </div>

            {/* Pause Icon */}
            <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-150 ease-in-out ${isPlaying
                    ? 'scale-100 blur-0 opacity-100'
                    : 'scale-75 blur-[1px] opacity-0'
                    }`}
            >
                <img src="/pause.svg" alt="pause" className="w-4 h-4" />
            </div>
        </button>
    );
} 