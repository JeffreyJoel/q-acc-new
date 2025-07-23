import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import YouTube from "react-youtube";
import React from "react";
import { Spinner } from "@/components/loaders/Spinner";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal = ({ isOpen, onClose }: VideoModalProps) => {
  const [loading, setLoading] = React.useState(true);
  const opts = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
      modestbranding: 1,
    },
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/95 opacity-90 backdrop-blur-xl"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 border-none p-0 rounded-none w-full h-full max-w-none translate-x-0 translate-y-0 top-0 left-0 flex items-center justify-center"
          )}
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors duration-200"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <div className="w-full max-w-4xl mx-auto aspect-video relative flex items-center justify-center">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 rounded-lg">
                <Spinner size={64} color="#fff" secondaryColor="#222" />
              </div>
            )}
            <YouTube
              videoId="m30ElzaR--4"
              opts={opts}
              className="w-full h-full"
              iframeClassName="rounded-lg border border-neutral-700 w-full h-full"
              onReady={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
