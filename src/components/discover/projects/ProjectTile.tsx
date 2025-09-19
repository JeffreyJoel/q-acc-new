import Image from "next/image";
import { cn } from "@/lib/utils";
import { capitalizeFirstLetter } from "@/helpers";
import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

interface ProjectTileProps {
  title: string;
  description: string;
  image: string;
  season: string | number;
  slug: string;
  className?: string;
  reelId: string;
  activeTile?: string | null;
  setActiveTile?: (slug: string | null) => void;
}

export function ProjectTile({
  title,
  description,
  image,
  season,
  className,
  slug,
  reelId,
  activeTile,
  setActiveTile,
}: ProjectTileProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [player, setPlayer] = useState<any>(null);
  const [showControls, setShowControls] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // This resets all player related state and destroys the YouTube player instance
  const resetPlayer = useCallback(() => {
    // This clears progress polling
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    setShowPlayer(false);
    setIsReady(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setIsMuted(false);
    setIsPlaying(false);

    if (player) {
      try {
        player.pauseVideo();
        player.destroy();
        setPlayer(null);
      } catch (error) {
        console.error("Error destroying player:", error);
      }
    }
  }, [player]);

  useEffect(() => {
    if (!showPlayer || activeTile !== slug) return;

    let isMounted = true;

    const loadYouTubeAPI = () => {
      return new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
          resolve(null);
          return;
        }

        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;

        (window as any).onYouTubeIframeAPIReady = resolve;

        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      });
    };

    const initializePlayer = async () => {
      try {
        await loadYouTubeAPI();

        if (!isMounted || !playerRef.current || activeTile !== slug) return;

        const newPlayer = new (window as any).YT.Player(playerRef.current, {
          height: "100%",
          width: "100%",
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
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted || activeTile !== slug) {
                // Not the active tile anymore – destroy and exit
                try {
                  event.target.destroy();
                } catch {}
                return;
              }
              // Mute first to satisfy browser autoplay policy
              try {
                event.target.mute();
              } catch {}
              setIsMuted(true);
              setPlayer(event.target);
              setDuration(event.target.getDuration());
              setIsReady(true);
              event.target.playVideo();
            },
            onStateChange: (event: any) => {
              if (!isMounted || activeTile !== slug) return;
              if (event.data === (window as any).YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            },
            onError: (event: any) => {
              if (!isMounted) return;
              console.error("YouTube player error:", event.data);
            },
          },
        });
      } catch (error) {
        console.error("Failed to initialize YouTube player:", error);
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
          console.error("Error destroying player:", error);
        }
      }
    };
  }, [showPlayer, reelId, activeTile, slug, player]);

  // This updates progress
  useEffect(() => {
    if (!player) return;

    // Clear any previous interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const interval = setInterval(() => {
      try {
        const current = player.getCurrentTime();
        const total = player.getDuration();

        // Duration can be 0 right after onReady; keep refreshing until > 0
        if (total > 0) {
          setDuration(total);
          setCurrentTime(current);
          setProgress((current / total) * 100);
        }
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }, 200);

    progressIntervalRef.current = interval;

    return () => {
      clearInterval(interval);
    };
  }, [player]);

  // This auto-hides controls
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

  // This resets player when another tile becomes active
  useEffect(() => {
    if (activeTile !== slug && showPlayer) {
      resetPlayer();
    }
  }, [activeTile, showPlayer, slug, resetPlayer]);

  const handleTileHover = () => {
    setShowPlayer(true);
    setShowControls(true);
    if (setActiveTile) setActiveTile(slug);
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
      console.error("Error toggling mute:", error);
    }
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!player || !isReady || duration <= 0) return;

    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;

      player.seekTo(newTime);
      setCurrentTime(newTime);
      setProgress((newTime / duration) * 100);
    } catch (error) {
      console.error("Error seeking:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    if (showPlayer || !hasVideo) {
      setShowControls(true);
    }
  };

  const handleMouseLeave = () => {
    setShowControls(false);
    if (setActiveTile && activeTile === slug) {
      setActiveTile(null);
    }
    if (showPlayer) {
      resetPlayer();
    }
  };

  const hasVideo = Boolean(reelId);

  return (
    <Link
      href={`/project/${slug}`}
      className={cn(
        "relative rounded-[20px] overflow-hidden shadow-lg bg-muted flex flex-col justify-end w-full max-w-[280px] flex-shrink-0 cursor-pointer",
        className
      )}
      style={{ aspectRatio: "3/4" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {hasVideo && showPlayer ? (
        <>
          {/* YouTube Player */}
          <div ref={playerRef} className="w-full h-full" />

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute top-4 right-4 flex gap-2 z-30">
              <button
                onClick={toggleMute}
                disabled={!isReady}
                className="bg-black/70 hover:bg-black/90 disabled:bg-gray-500 disabled:opacity-50 text-white p-2 rounded-full transition-colors shadow-lg"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
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
        <div
          onMouseEnter={() => {
            if (activeTile !== slug) {
              handleTileHover();
            }
          }}
          className="w-full h-full"
        >
          {/* Project cover image */}
          <Image
            src={image}
            alt={title}
            fill
            className="object-center object-cover"
            priority
          />

          {/* Show placeholder text when no video is available and hovered */}
          {!hasVideo && showControls && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
              <span className="text-white text-sm font-semibold">Video coming soon</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/85 z-10" />

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
    </Link>
  );
}

export default ProjectTile;
