import { useDailyUsage } from "@/hooks/usage/useDailyUsage";
import { useFormatResetTime } from "@/hooks/formatting/useFormatResetTime";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DailyUsageDisplaySkeleton } from "@/components/skeletons/DailyUsageDisplaySkeleton";
import { AlertCircle, CheckCircle2, ExternalLink, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

interface DailyUsageDisplayProps {
  compact?: boolean;
  className?: string;
}

export const DailyUsageDisplay = ({ compact = false, className }: DailyUsageDisplayProps) => {
  const { canMakeRequest, currentImages, maxImages, resetAt, isUnlimited, isLoading } = useDailyUsage();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { formatResetTime } = useFormatResetTime();
  const navigate = useNavigate();
  
  // Hide component only when sidebar is collapsed (icon mode on desktop)
  // On mobile, always show when sidebar is open (Sheet)
  if (!isMobile && state === "collapsed") {
    return null;
  }

  if (isLoading) {
    return <DailyUsageDisplaySkeleton compact={compact} className={className} />;
  }

  const percentage = isUnlimited ? 0 : (currentImages / maxImages) * 100;
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isExceeded = !isUnlimited && !canMakeRequest;

  const getStatusColor = () => {
    if (isUnlimited) return "default";
    if (isExceeded) return "destructive";
    if (isNearLimit) return "secondary";
    return "default";
  };

  const handleClick = () => {
    navigate("/platform/usage");
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  if (compact) {
    return (
      <div 
        onClick={handleClick}
        className={cn(
          "flex flex-col gap-1.5 px-2 py-2 cursor-pointer transition-colors hover:bg-sidebar-accent rounded-md",
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Daily Usage</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </div>
          {isUnlimited ? (
            <Badge variant="default" className="text-xs">
              <Infinity className="h-3 w-3 badge-icon" />
            </Badge>
          ) : (
            <Badge variant={getStatusColor()} className="text-xs">
              {currentImages} / {maxImages}
            </Badge>
          )}
        </div>
        {!isUnlimited && <Progress value={percentage} className="h-1.5" />}
        {!isUnlimited && isExceeded && resetAt && (
          <p className="text-xs text-muted-foreground">Resets in {formatResetTime(resetAt)}</p>
        )}
        {isUnlimited ? (
          <p className="text-xs text-muted-foreground">Unlimited requests available</p>
        ) : (
          <p className="text-xs text-muted-foreground">{maxImages - currentImages} images remaining today</p>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "flex flex-col gap-2 p-3 rounded-lg border bg-card cursor-pointer transition-colors hover:bg-accent",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isUnlimited ? (
            <Infinity className="h-4 w-4 text-primary" />
          ) : isExceeded ? (
            <AlertCircle className="h-4 w-4 text-destructive" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">Daily Usage Limit</span>
        </div>
        {isUnlimited ? (
          <Badge variant="default">
            <Infinity className="h-3 w-3 mr-1 badge-icon" />
            Unlimited
          </Badge>
        ) : (
          <Badge variant={getStatusColor()}>
            {currentImages} / {maxImages}
          </Badge>
        )}
      </div>
      
      {!isUnlimited && (
        <Progress 
          value={percentage} 
          className={cn(
            "h-2",
            isExceeded && "bg-destructive/20 [&>div]:bg-destructive",
            isNearLimit && !isExceeded && "bg-yellow-500/20 [&>div]:bg-yellow-500"
          )}
        />
      )}
      
      {isUnlimited ? (
        <p className="text-xs text-muted-foreground">
          Unlimited requests available (Admin)
        </p>
      ) : isExceeded ? (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-destructive font-medium">
            Daily limit reached
          </p>
          {resetAt && (
            <p className="text-xs text-muted-foreground">
              Resets in {formatResetTime(resetAt)}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {maxImages - currentImages} images remaining today
        </p>
      )}
    </div>
  );
};
