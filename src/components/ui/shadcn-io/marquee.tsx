import * as React from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  pauseOnHover?: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  fade?: boolean;
  className?: string;
}

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  ({ className, pauseOnHover = false, direction = 'left', fade = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'group relative flex w-full overflow-hidden',
          '[--duration:40s] [--gap:1rem]',
          direction === 'left' && '[--direction:normal]',
          direction === 'right' && '[--direction:reverse]',
          className
        )}
        {...props}
      >
        {fade && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/4 bg-gradient-to-r from-background" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-1/4 bg-gradient-to-l from-background" />
          </>
        )}
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === MarqueeContent) {
            return React.cloneElement(child as React.ReactElement<any>, {
              pauseOnHover,
              direction,
            });
          }
          return child;
        })}
      </div>
    );
  }
);
Marquee.displayName = 'Marquee';

interface MarqueeContentProps extends React.HTMLAttributes<HTMLDivElement> {
  pauseOnHover?: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
}

const MarqueeContent = React.forwardRef<HTMLDivElement, MarqueeContentProps>(
  ({ className, pauseOnHover = false, direction = 'left', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex min-w-full shrink-0 gap-[--gap]',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
          direction === 'left' && 'animate-marquee-left',
          direction === 'right' && 'animate-marquee-right',
          className
        )}
        {...props}
      >
        {children}
        {React.Children.map(children, (child) => {
          return React.cloneElement(child as React.ReactElement, {
            'aria-hidden': true,
            className: cn((child as React.ReactElement).props.className, 'pointer-events-none'),
          });
        })}
      </div>
    );
  }
);
MarqueeContent.displayName = 'MarqueeContent';

interface MarqueeItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const MarqueeItem = React.forwardRef<HTMLDivElement, MarqueeItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('shrink-0', className)}
        {...props}
      />
    );
  }
);
MarqueeItem.displayName = 'MarqueeItem';

interface MarqueeFadeProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right' | 'top' | 'bottom';
}

const MarqueeFade = React.forwardRef<HTMLDivElement, MarqueeFadeProps>(
  ({ className, side = 'left', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'pointer-events-none absolute z-10 h-full w-1/4',
          side === 'left' && 'left-0 bg-gradient-to-r from-background',
          side === 'right' && 'right-0 bg-gradient-to-l from-background',
          side === 'top' && 'top-0 h-1/4 w-full bg-gradient-to-b from-background',
          side === 'bottom' && 'bottom-0 h-1/4 w-full bg-gradient-to-t from-background',
          className
        )}
        {...props}
      />
    );
  }
);
MarqueeFade.displayName = 'MarqueeFade';

export { Marquee, MarqueeContent, MarqueeItem, MarqueeFade };

