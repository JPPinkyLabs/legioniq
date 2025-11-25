'use client';

import {
  SiApple,
  SiFacebook,
  SiGithub,
  SiGoogle,
  SiInstagram,
  SiX,
  SiYoutube,
} from '@icons-pack/react-simple-icons';
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from '@/components/ui/shadcn-io/announcement';
import {
  Marquee,
  MarqueeContent,
  MarqueeFade,
  MarqueeItem,
} from '@/components/ui/shadcn-io/marquee';
import { Button } from '@/components/ui/button';
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerTimeDisplay,
  VideoPlayerTimeRange,
  VideoPlayerVolumeRange,
} from '@/components/ui/shadcn-io/video-player';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';

const logos = [
  {
    name: 'GitHub',
    icon: SiGithub,
    url: 'https://github.com',
  },
  {
    name: 'Facebook',
    icon: SiFacebook,
    url: 'https://facebook.com',
  },
  {
    name: 'Google',
    icon: SiGoogle,
    url: 'https://google.com',
  },
  {
    name: 'X',
    icon: SiX,
    url: 'https://x.com',
  },
  {
    name: 'Apple',
    icon: SiApple,
    url: 'https://apple.com',
  },
  {
    name: 'Instagram',
    icon: SiInstagram,
    url: 'https://instagram.com',
  },
  {
    name: 'YouTube',
    icon: SiYoutube,
    url: 'https://youtube.com',
  },
];

export function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/platform');
    } else {
      navigate('/auth');
    }
  };

  const handleLearnMore = () => {
    // Scroll to features section or navigate to about page
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-12 px-8 pt-16 pb-8 text-center">
      <div className="flex flex-col items-center justify-center gap-8">
        <Link to="#">
          <Announcement>
            <AnnouncementTag>Latest</AnnouncementTag>
            <AnnouncementTitle>Introducing Legion IQ</AnnouncementTitle>
          </Announcement>
        </Link>
        <h1 className="mx-auto mb-0 max-w-4xl text-balance font-medium text-6xl md:text-7xl xl:text-[5.25rem]">
          The best way to analyze your games
        </h1>
        <p className="mx-auto mt-0 mb-0 max-w-4xl text-balance text-lg text-muted-foreground">
          Legion IQ is a new way to analyze your games. Use advanced AI
          to understand competitive strategies and get instant insights,
          gameplay tips, and strategic advice.
        </p>
        <div className="flex items-center gap-2">
          <Button size="lg" onClick={handleGetStarted}>
            Get started
          </Button>
          <Button variant="outline" size="lg" onClick={handleLearnMore}>
            Learn more
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">
          Powered by{' '}
          <a
            href="https://pinkylabs.io"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            © Pinky Labs LLC
          </a>
        </p>
      </div>
    </div>
  );
}
