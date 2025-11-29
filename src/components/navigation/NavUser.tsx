import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  User,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { ResponsiveDropdown } from "@/components/ui/responsive-dropdown";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { getInitials } from "@/hooks/auth/useUserUtils";
import { useAvatarUrl } from "@/hooks/avatar/useAvatarUrl";
import { useTheme } from "@/contexts/ThemeContext";

interface NavUserProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout: () => void;
  onNavigate: (path: string) => void;
  onOpenSettings?: () => void;
}

export function NavUser({ user, onLogout, onNavigate, onOpenSettings }: NavUserProps) {
  const { isMobile, setOpenMobile, state } = useSidebar();
  const { avatarUrl, handleImageError } = useAvatarUrl();
  const { theme, toggleTheme } = useTheme();

  const handleNavigate = (path: string) => {
    onNavigate(path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    }
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Use avatarUrl from hook if available, otherwise fallback to user.avatar prop
  const displayAvatar = avatarUrl || user.avatar;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <ResponsiveDropdown
          trigger={
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={displayAvatar}
                  alt={user.name}
                  onError={handleImageError}
                />
                <AvatarFallback className="rounded-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-1">
                  <span className="truncate font-medium">{user.name}</span>
                  <BadgeCheck className="h-3 w-3 text-blue-500" />
                </div>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          }
          header={
            <div className="text-left">
              <span className="truncate text-sm text-muted-foreground">{user.email}</span>
            </div>
          }
          items={[
            {
              label: "Account",
              icon: <User className="h-4 w-4" />,
              onClick: () => handleNavigate("/platform/account"),
            },
            {
              label: "Settings",
              icon: <Settings className="h-4 w-4" />,
              onClick: handleOpenSettings,
            },
            {
              label: theme === "dark" ? "Light Mode" : "Dark Mode",
              icon: theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
              onClick: toggleTheme,
              separator: true,
            },
            {
              label: "Log out",
              icon: <LogOut className="h-4 w-4" />,
              onClick: onLogout,
              variant: 'destructive',
            },
          ]}
          align={state === "collapsed" ? "start" : "end"}
          sideOffset={state === "collapsed" ? 8 : 4}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
