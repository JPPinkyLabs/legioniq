import { useUserStats } from "@/hooks/auth/useUserStats";
import { useCategories } from "@/hooks/other/useCategories";
import { useFormatNumber } from "@/hooks/formatting/useFormatNumber";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import {
  Activity,
  Image as ImageIcon,
  LogIn,
  Target,
  AlertCircle,
} from "lucide-react";
import { UserStatsSkeleton } from "@/components/skeletons/UserStatsSkeleton";
import { ErrorEmpty } from "@/components/ErrorEmpty";
import * as React from "react";

export const UserStats = () => {
  const { stats, isLoading, error, refetch } = useUserStats();
  const { categories } = useCategories();
  const { formatNumber } = useFormatNumber();

  if (isLoading) {
    return <UserStatsSkeleton />;
  }

  if (error) {
    return (
      <ErrorEmpty
        icon={AlertCircle}
        title="Error loading statistics"
        description={
          error instanceof Error
            ? error.message
            : "Failed to load your account statistics. Please try again."
        }
        buttons={[
          {
            label: "Try Again",
            onClick: () => refetch(),
            variant: "default",
          },
        ]}
      />
    );
  }

  if (!stats) {
    return null;
  }

  const getCategoryLabel = (category: string) => {
    const categoryData = categories.find((cat) => cat.category === category);
    return categoryData?.label || category;
  };

  const metrics = [
    {
      name: "Total Requests",
      value: stats.totalRequests,
      icon: <Activity className="h-5 w-5" />,
      color: "bg-blue-500",
      unit: "requests",
    },
    {
      name: "Images Uploaded",
      value: stats.totalImages,
      icon: <ImageIcon className="h-5 w-5" />,
      color: "bg-green-500",
      unit: "images",
    },
    {
      name: "Login Sessions",
      value: stats.totalLogins,
      icon: <LogIn className="h-5 w-5" />,
      color: "bg-purple-500",
      unit: "sessions",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Usage & Analytics
          </CardTitle>
          <CardDescription>
            Your account usage statistics and activity
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ItemGroup className="flex-1 flex flex-col justify-between">
            {metrics.map((metric, index) => (
              <React.Fragment key={metric.name}>
                <Item className="px-0 flex-1 flex items-center">
                  <ItemMedia>
                    <div className={`rounded-full ${metric.color.replace('bg-', 'bg-opacity-10 bg-')} p-2`}>
                      {metric.icon}
                    </div>
                  </ItemMedia>
                  <ItemContent className="gap-1">
                    <ItemTitle>{metric.name}</ItemTitle>
                    <ItemDescription>
                      {formatNumber(metric.value)} {metric.unit}
                    </ItemDescription>
                  </ItemContent>
                </Item>
                {index !== metrics.length - 1 && <ItemSeparator className="mx-0" />}
              </React.Fragment>
            ))}
          </ItemGroup>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Category Usage
          </CardTitle>
          <CardDescription>
            Most frequently used analysis categories
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {stats.categoryBreakdown.length > 0 ? (
            <div className="flex flex-col justify-between h-full gap-4">
              {stats.categoryBreakdown.map((item, index) => (
                <div key={item.category} className="space-y-2 flex-1 flex flex-col justify-center min-h-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0 text-xs">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{getCategoryLabel(item.category)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {item.count} {item.count === 1 ? 'request' : 'requests'}
                      </span>
                      <span className="text-sm font-medium">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full py-8">
              <p className="text-muted-foreground text-center">
                No categories used yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

