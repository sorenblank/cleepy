'use client';

import { useState } from 'react';
import ControlsSection from './components/ControlsSection';
import VideoTabSection from './components/VideoTabSection';

export default function Home() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(580); // 9 minutes 40 seconds default

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
  };

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
    // Here you would typically update your video player's current time
    console.log('Time changed to:', time);
  };

  const handleRangeChange = (leftTime: number, rightTime: number) => {
    // Handle range selection changes
    console.log('Range changed:', leftTime, 'to', rightTime);
  };

  const handlePlayStateChange = (isPlaying: boolean) => {
    // Handle play/pause state changes
    console.log('Playing:', isPlaying);
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
        onSearchStart={handleSearchStart}
        onLoadingComplete={handleLoadingComplete}
        onClose={handleClose}
      />

      {/* the controls tab */}
      <ControlsSection
        isVideoLoaded={isVideoLoaded}
        totalDuration={totalDuration}
        currentTime={currentTime}
        onTimeChange={handleTimeChange}
        onRangeChange={handleRangeChange}
        onPlayStateChange={handlePlayStateChange}
        onExport={handleExport}
      />
    </main>
  );
}
