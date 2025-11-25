import * as React from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const VideoPlayerContext = React.createContext<{
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
} | null>(null);

const VideoPlayer = React.forwardRef<HTMLDivElement, VideoPlayerProps>(
  ({ className, children, ...props }, ref) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolume] = React.useState(1);
    const [isMuted, setIsMuted] = React.useState(false);

    React.useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const updateTime = () => setCurrentTime(video.currentTime);
      const updateDuration = () => setDuration(video.duration);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('loadedmetadata', updateDuration);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      return () => {
        video.removeEventListener('timeupdate', updateTime);
        video.removeEventListener('loadedmetadata', updateDuration);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }, []);

    return (
      <VideoPlayerContext.Provider
        value={{
          videoRef,
          isPlaying,
          setIsPlaying,
          currentTime,
          setCurrentTime,
          duration,
          setDuration,
          volume,
          setVolume,
          isMuted,
          setIsMuted,
        }}
      >
        <div ref={ref} className={cn('relative', className)}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === VideoPlayerContent) {
              return React.cloneElement(child as React.ReactElement<any>, {
                ref: videoRef,
              });
            }
            return child;
          })}
        </div>
      </VideoPlayerContext.Provider>
    );
  }
);
VideoPlayer.displayName = 'VideoPlayer';

const VideoPlayerContent = React.forwardRef<HTMLVideoElement, React.VideoHTMLAttributes<HTMLVideoElement>>(
  ({ className, ...props }, ref) => {
    return <video ref={ref} className={cn('w-full', className)} {...props} />;
  }
);
VideoPlayerContent.displayName = 'VideoPlayerContent';

const useVideoPlayer = () => {
  const context = React.useContext(VideoPlayerContext);
  if (!context) {
    throw new Error('Video player components must be used within VideoPlayer');
  }
  return context;
};

const VideoPlayerControlBar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-black/50 p-2', className)}
        {...props}
      />
    );
  }
);
VideoPlayerControlBar.displayName = 'VideoPlayerControlBar';

const VideoPlayerPlayButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { videoRef, isPlaying, setIsPlaying } = useVideoPlayer();

    const togglePlay = () => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    };

    return (
      <Button ref={ref} variant="ghost" size="icon" onClick={togglePlay} className={cn('h-8 w-8', className)} {...props}>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
    );
  }
);
VideoPlayerPlayButton.displayName = 'VideoPlayerPlayButton';

const VideoPlayerSeekBackwardButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { videoRef } = useVideoPlayer();

  const seekBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  return (
    <Button ref={ref} variant="ghost" size="icon" onClick={seekBackward} className={cn('h-8 w-8', className)} {...props}>
      <SkipBack className="h-4 w-4" />
    </Button>
  );
});
VideoPlayerSeekBackwardButton.displayName = 'VideoPlayerSeekBackwardButton';

const VideoPlayerSeekForwardButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { videoRef } = useVideoPlayer();

  const seekForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10);
    }
  };

  return (
    <Button ref={ref} variant="ghost" size="icon" onClick={seekForward} className={cn('h-8 w-8', className)} {...props}>
      <SkipForward className="h-4 w-4" />
    </Button>
  );
});
VideoPlayerSeekForwardButton.displayName = 'VideoPlayerSeekForwardButton';

const VideoPlayerTimeRange = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const { videoRef, currentTime, duration } = useVideoPlayer();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (videoRef.current) {
        const newTime = (parseFloat(e.target.value) / 100) * duration;
        videoRef.current.currentTime = newTime;
      }
    };

    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
      <input
        ref={ref}
        type="range"
        min="0"
        max="100"
        value={percentage}
        onChange={handleChange}
        className={cn('flex-1', className)}
        {...props}
      />
    );
  }
);
VideoPlayerTimeRange.displayName = 'VideoPlayerTimeRange';

const VideoPlayerTimeDisplay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { showDuration?: boolean }>(
  ({ className, showDuration = false, ...props }, ref) => {
    const { currentTime, duration } = useVideoPlayer();

    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div ref={ref} className={cn('text-xs text-white', className)} {...props}>
        {formatTime(currentTime)}
        {showDuration && ` / ${formatTime(duration)}`}
      </div>
    );
  }
);
VideoPlayerTimeDisplay.displayName = 'VideoPlayerTimeDisplay';

const VideoPlayerMuteButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { videoRef, isMuted, setIsMuted } = useVideoPlayer();

    const toggleMute = () => {
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    };

    return (
      <Button ref={ref} variant="ghost" size="icon" onClick={toggleMute} className={cn('h-8 w-8', className)} {...props}>
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
    );
  }
);
VideoPlayerMuteButton.displayName = 'VideoPlayerMuteButton';

const VideoPlayerVolumeRange = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const { videoRef, volume, setVolume } = useVideoPlayer();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value) / 100;
      if (videoRef.current) {
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
      }
    };

    return (
      <input
        ref={ref}
        type="range"
        min="0"
        max="100"
        value={volume * 100}
        onChange={handleChange}
        className={cn('w-20', className)}
        {...props}
      />
    );
  }
);
VideoPlayerVolumeRange.displayName = 'VideoPlayerVolumeRange';

export {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerTimeRange,
  VideoPlayerTimeDisplay,
  VideoPlayerMuteButton,
  VideoPlayerVolumeRange,
};

