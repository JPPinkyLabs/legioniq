import { useDailyUsage } from "@/hooks/usage/useDailyUsage";
import { useFormatResetTime } from "@/hooks/formatting/useFormatResetTime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Calendar,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { UsageSkeleton } from "@/components/skeletons/UsageSkeleton";
import { ErrorEmpty } from "@/components/ErrorEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserStats } from "@/pages/platform/account/components/UserStats";

const Usage = () => {
  const navigate = useNavigate();
  const { currentImages, maxImages, resetAt, isLoading: isLoadingDaily, error: dailyError } = useDailyUsage();
  const { formatResetTime } = useFormatResetTime();

  const isLoading = isLoadingDaily;
  const error = dailyError;

  const BackButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate("/platform")}
      className="text-muted-foreground hover:text-foreground -ml-2"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  );

  return (
    <ScrollArea className="h-full">
      <div className="px-5 mx-4 md:mx-6 lg:mx-8 max-w-5xl md:max-w-5xl lg:max-w-5xl xl:max-w-5xl 2xl:max-w-8xl 2xl:mx-auto py-3">
        <div className="space-y-6">
        <div className="space-y-3">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold">Usage & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              View your account usage statistics and daily limits
            </p>
          </div>
        </div>

        {isLoading ? (
          <UsageSkeleton />
        ) : error ? (
          <ErrorEmpty
            icon={AlertCircle}
            title="Error loading usage data"
            description={
              error instanceof Error
                ? error.message
                : "Failed to load your usage statistics. Please try again."
            }
            buttons={[
              {
                label: "Try Again",
                onClick: () => window.location.reload(),
                variant: "default",
              },
            ]}
          />
        ) : (
          <>
            {/* Daily Usage Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Daily Usage
                </CardTitle>
                <CardDescription>
                  Your daily image analysis limit and remaining quota
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const dailyPercentage = maxImages > 0 ? (currentImages / maxImages) * 100 : 0;
                  const isNearLimit = dailyPercentage >= 80;
                  const isExceeded = dailyPercentage >= 100;

                  return (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant={isExceeded ? "destructive" : isNearLimit ? "secondary" : "default"}
                            className="text-sm"
                          >
                            {currentImages} / {maxImages}
                          </Badge>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">images today</span>
                        </div>
                        {resetAt && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">Resets in {formatResetTime(resetAt)}</span>
                          </div>
                        )}
                      </div>
                      <Progress 
                        value={dailyPercentage} 
                        className={cn(
                          "h-3",
                          isExceeded && "bg-destructive/20 [&>div]:bg-destructive",
                          isNearLimit && !isExceeded && "bg-yellow-500/20 [&>div]:bg-yellow-500"
                        )}
                      />
                      <p className="text-sm text-muted-foreground">
                        {maxImages - currentImages} images remaining today
                      </p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Usage & Analytics - Using centralized UserStats component */}
            <UserStats />
          </>
        )}
        </div>
      </div>
    </ScrollArea>
  );
};

export default Usage;

