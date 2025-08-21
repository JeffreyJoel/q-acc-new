import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

const YouTubeShortsPlayer = ({ videoId = "UR7RPTpEl8Q" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [player, setPlayer] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef(null);

  // Load YouTube IFrame API
  useEffect(() => {
    let isMounted = true;

    const loadYouTubeAPI = () => {
      return new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
          resolve(null);
          return;
        }

        // Create script tag
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        
        // Set up the callback
        window.onYouTubeIframeAPIReady = resolve;
        
        // Add to page
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      });
    };

    const initializePlayer = async () => {
      try {
        await loadYouTubeAPI();
        
        if (!isMounted) return;

        const newPlayer = new window.YT.Player(playerRef.current, {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            fs: 0,
            cc_load_policy: 0,
            iv_load_policy: 3,
            autohide: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              console.log('Player ready');
              setPlayer(event.target);
              setDuration(event.target.getDuration());
              setIsReady(true);
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              console.log('State changed:', event.data);
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            },
            onError: (event: any) => {
              console.error('YouTube player error:', event.data);
            }
          },
        });
      } catch (error) {
        console.error('Failed to initialize YouTube player:', error);
      }
    };

    initializePlayer();

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  // Update progress
  useEffect(() => {
    if (!player || !isPlaying) return;

    const interval = setInterval(() => {
      try {
        const current = (player as any).getCurrentTime();
        const total = (player as any).getDuration();
        if (current && total) {
          setCurrentTime(current);
          setProgress((current / total) * 100);
        }
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player, isPlaying]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showControls, isPlaying]);

  const togglePlay = () => {
    if (!player || !isReady) return;
    
    try {
      if (isPlaying) {
        (player as any).pauseVideo();
      } else {
        (player as any).playVideo();
      }
    } catch (error) {
      console.error('Error toggling play:', error);
    }
  };

  const toggleMute = () => {
    if (!player || !isReady) return;
    
    try {
      if (isMuted) {
        (player as any).unMute();
        setIsMuted(false);
      } else {
        (player as any).mute();
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const restart = () => {
    if (!player || !isReady) return;
    
    try {
      (player as any).seekTo(0);
      setProgress(0);
      setCurrentTime(0);
    } catch (error) {
      console.error('Error restarting:', error);
    }
  };

  const handleProgressClick = (e: any) => {
    if (!player || !isReady) return;
    
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      
      (player as any).seekTo(newTime);
      setCurrentTime(newTime);
      setProgress(percentage * 100);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  return (
    <div 
      className="relative w-full max-w-sm mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl"
      style={{ aspectRatio: '9/16', height: '600px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* YouTube Player */}
      <div ref={playerRef} className="w-full h-full" />
      
      {/* Custom Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={toggleMute}
            disabled={!isReady}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white p-2 rounded-full transition-colors shadow-lg"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>

        {/* Center Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              disabled={!isReady}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white p-6 rounded-full transition-all transform hover:scale-110 shadow-2xl"
            >
              <Play size={32} fill="white" />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <div 
              className="w-full h-1 bg-white/30 rounded-full cursor-pointer hover:h-2 transition-all"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-white text-xs mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={restart}
              disabled={!isReady}
              className="bg-orange-500/80 hover:bg-orange-500 disabled:bg-gray-500 text-white p-3 rounded-full transition-colors"
            >
              <RotateCcw size={20} />
            </button>
            
            <button
              onClick={togglePlay}
              disabled={!isReady}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white p-4 rounded-full transition-colors shadow-lg"
            >
              {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
          <p className="text-sm">Loading YouTube Short...</p>
        </div>
      )}

      {/* Debug Info */}
      <div className="absolute top-4 left-4 text-white text-xs bg-black/50 p-2 rounded">
        <div>Ready: {isReady ? 'Yes' : 'No'}</div>
        <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
        <div>Duration: {duration}s</div>
      </div>
    </div>
  );
};

export default YouTubeShortsPlayer;