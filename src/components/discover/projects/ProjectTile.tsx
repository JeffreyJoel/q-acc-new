import Image from "next/image";
import { cn } from "@/lib/utils";
import { capitalizeFirstLetter } from "@/helpers";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';

interface ProjectTileProps {
  title: string;
  description: string;
  image: string;
  season: string | number;
  slug: string;
  className?: string;
  reelId: string;
}

export function ProjectTile({
  title,
  description,
  image,
  season,
  className,
  slug,
  reelId,
}: ProjectTileProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [showControls, setShowControls] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPlayer) return;

    let isMounted = true;

    const loadYouTubeAPI = () => {
      return new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
          resolve(null);
          return;
        }

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;

        (window as any).onYouTubeIframeAPIReady = resolve;

        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      });
    };

    const initializePlayer = async () => {
      try {
        await loadYouTubeAPI();

        if (!isMounted || !playerRef.current) return;

        const newPlayer = new (window as any).YT.Player(playerRef.current, {
          height: '100%',
          width: '100%',
          videoId: reelId,
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
            loop: 1,
            playlist: reelId,
            enablejsapi: 1,
            autoplay: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              console.log('Player ready');
              setPlayer(event.target);
              setDuration(event.target.getDuration());
              setIsReady(true);
              setIsMuted(event.target.isMuted());
              event.target.playVideo();
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              console.log('State changed:', event.data);
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
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
      if (player) {
        try {
          player.destroy();
          setPlayer(null);
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
    };
  }, [showPlayer, reelId]);

  // Update progress
  useEffect(() => {
    if (!player || !isPlaying) return;

    const interval = setInterval(() => {
      try {
        const current = player.getCurrentTime();
        const total = player.getDuration();
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
    if (!showPlayer) return;

    if (showControls) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showControls, isPlaying, showPlayer]);

  const handleTileClick = () => {
    setShowPlayer(true);
    setShowControls(true);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowPlayer(false);
    setIsPlaying(false);
    setIsReady(false);
    setProgress(0);
    setCurrentTime(0);
    setIsMuted(false);
    if (player) {
      try {
        player.destroy();
        setPlayer(null);
      } catch (error) {
        console.error('Error destroying player on close:', error);
      }
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!player || !isReady) return;
    
    try {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    } catch (error) {
      console.error('Error toggling play:', error);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!player || !isReady) return;

    try {
      if (isMuted) {
        player.unMute();
        setIsMuted(false);
      } else {
        player.mute();
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!player || !isReady) return;
    
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      
      player.seekTo(newTime);
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
    if (showPlayer) {
      setShowControls(true);
    }
  };

  const handleMouseLeave = () => {
    if (showPlayer && isPlaying) {
      setShowControls(false);
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-[20px] overflow-hidden shadow-lg bg-muted flex flex-col justify-end min-h-[354px] w-[220px] flex-shrink-0 cursor-pointer",
        className
      )}
      style={{ aspectRatio: "3/4" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {showPlayer ? (
        <>
          {/* YouTube Player */}
          <div ref={playerRef} className="w-full h-full" />
          
          <div 
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
        
            <div className="absolute top-4 right-4 flex gap-2 z-30">
     
              <button
                onClick={handleClose}
                disabled={!isReady}
                className="bg-black/70 hover:bg-black/90 disabled:bg-gray-500 disabled:opacity-50 text-white p-2 rounded-full transition-colors shadow-lg"
              >
                <X size={20} />
              </button>
 
              <button
                onClick={toggleMute}
                disabled={!isReady}
                className="bg-black/70 hover:bg-black/90 disabled:bg-gray-500 disabled:opacity-50 text-white p-2 rounded-full transition-colors shadow-lg"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>


            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                onClick={togglePlay}
                disabled={!isReady}
                className="bg-black/50 hover:bg-black/70 disabled:bg-gray-500 disabled:opacity-50 text-white p-4 rounded-full transition-colors shadow-lg pointer-events-auto"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Progress Bar */}
              <div className="mb-2">
                <div 
                  className="w-full h-1 bg-white/30 rounded-full cursor-pointer hover:h-2 transition-all"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="h-full bg-peach-400 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-white text-xs mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {!isReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-white z-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-peach-400 border-t-transparent mb-4"></div>
              <p className="text-sm">Loading Founder Reel...</p>
            </div>
          )}
        </>
      ) : (
        /* Tile View */
        <div onClick={handleTileClick} className="w-full h-full">
          <Image
            src={image}
            alt={title}
            fill
            className="object-center object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/85 z-10" />
          
          {/* <div className="absolute inset-0 flex items-center justify-center z-15">
            <div className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors shadow-lg">
              <Play size={16} fill="white" />
            </div>
          </div> */}

          <div className="absolute bottom-2 left-0 right-0 z-20 p-3 flex flex-col gap-2">
            <span className="inline-block bg-peach-400 text-black text-[8px] font-bold font-inter px-1 py-0.5 rounded-md mb-1 w-fit shadow uppercase tracking-wide">
              Season {season}
            </span>
            <h3 className="text-white text-base font-bold font-inter leading-tight drop-shadow-lg mb-0">
              {title}
            </h3>
            <p className="text-white/85 text-[11px] leading-snug font-medium font-inter drop-shadow max-w-xs line-clamp-4">
              {capitalizeFirstLetter(description) || "No description available"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectTile;