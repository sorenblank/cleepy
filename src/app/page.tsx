'use client';

import { useState, useRef, useEffect } from 'react';
import ControlsSection from './components/ControlsSection';
import VideoTabSection, { VideoTabSectionRef } from './components/VideoTabSection';

export default function Home() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const videoPlayerRef = useRef<VideoTabSectionRef>(null);

  // Add keyboard event listener for spacebar play/pause
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle spacebar when video is loaded
      if (event.code === 'Space' && isVideoLoaded) {
        event.preventDefault(); // Prevent page scrolling
        const newIsPlaying = !isPlaying;
        setIsPlaying(newIsPlaying);
        // Control the video player
        if (videoPlayerRef.current) {
          if (newIsPlaying) {
            videoPlayerRef.current.play();
          } else {
            videoPlayerRef.current.pause();
          }
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVideoLoaded, isPlaying]); // Dependencies: re-run when these change

  const handleSearchStart = () => {
    // Keep the controls hidden during loading
    setIsVideoLoaded(false);
  };

  const handleLoadingComplete = () => {
    // Show the controls after loading is complete
    setIsVideoLoaded(true);
  };

  const handleClose = () => {
    // Reset to default state - hide controls
    setIsVideoLoaded(false);
    setIsPlaying(false);
  };

  const handleProgress = (currentTime: number, duration: number) => {
    setCurrentTime(currentTime);
    // Only update duration if it's a valid number and different from current
    if (duration && !isNaN(duration) && duration !== totalDuration) {
      setTotalDuration(duration);
    }
  };

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
    // Seek the video player to the new time
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekTo(time);
    }
    console.log('Time changed to:', time);
  };

  const handleRangeChange = (leftTime: number, rightTime: number) => {
    // Handle range selection changes
    console.log('Range changed:', leftTime, 'to', rightTime);
  };

  const handlePlayStateChange = (newIsPlaying: boolean) => {
    setIsPlaying(newIsPlaying);
    // Control the video player
    if (videoPlayerRef.current) {
      if (newIsPlaying) {
        videoPlayerRef.current.play();
      } else {
        videoPlayerRef.current.pause();
      }
    }
    console.log('Playing:', newIsPlaying);
  };

  const handleVideoPlayStateChange = (newIsPlaying: boolean) => {
    // This handles play state changes from the video player itself
    setIsPlaying(newIsPlaying);
  };

  const handleExport = (leftTime: number, rightTime: number) => {
    // Handle export functionality
    console.log('Exporting from', leftTime, 'to', rightTime);
    alert(`Exporting video segment from ${Math.floor(leftTime / 60)}:${(leftTime % 60).toString().padStart(2, '0')} to ${Math.floor(rightTime / 60)}:${(rightTime % 60).toString().padStart(2, '0')}`);
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      {/* the video tab / player and initial state */}
      <VideoTabSection
        ref={videoPlayerRef}
        onSearchStart={handleSearchStart}
        onLoadingComplete={handleLoadingComplete}
        onClose={handleClose}
        onPlayStateChange={handleVideoPlayStateChange}
        onProgress={handleProgress}
      />

      {/* the controls tab */}
      <ControlsSection
        isVideoLoaded={isVideoLoaded}
        totalDuration={totalDuration}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onTimeChange={handleTimeChange}
        onRangeChange={handleRangeChange}
        onPlayStateChange={handlePlayStateChange}
        onExport={handleExport}
      />
    </main>
  );
}
