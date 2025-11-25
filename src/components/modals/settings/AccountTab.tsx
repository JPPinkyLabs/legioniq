import { useAuth } from "@/hooks/auth/useAuth";
import { useUserUtils } from "@/hooks/auth/useUserUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun, BadgeCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";
import { useAvatarUrl } from "@/hooks/avatar/useAvatarUrl";
import { UserPreferencesSection } from "@/pages/platform/account/components/UserPreferencesSection";

export const AccountTab = () => {
  const { user } = useAuth();
  const { getUserInitials, getJoinDate, getUserName } = useUserUtils();
  const { theme, toggleTheme } = useTheme();
  const { avatarUrl, handleImageError } = useAvatarUrl();

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 pr-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your account details and identification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={avatarUrl || undefined}
                  alt={getUserName()}
                  onError={handleImageError}
                />
                <AvatarFallback className="text-xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-lg">{getUserName()}</p>
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                </div>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground">Joined {getJoinDate()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the appearance of the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "light" ? (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex flex-col gap-1">
                  <Label htmlFor="theme-toggle" className="cursor-pointer">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {theme === "dark" ? "Dark mode is enabled" : "Light mode is enabled"}
                  </p>
                </div>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        <UserPreferencesSection onResetClick={() => {}} showResetButton={false} />
      </div>
    </ScrollArea>
  );
};

