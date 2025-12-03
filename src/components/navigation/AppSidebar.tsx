import { Sparkles, MessagesSquare, Plus, FileText, ListChecks, type LucideIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import { useUserUtils } from "@/hooks/auth/useUserUtils";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsModal } from "@/contexts/SettingsModalContext";

import { NavMain } from "@/components/navigation/NavMain";
import { NavUser } from "@/components/navigation/NavUser";
import { AppHeader } from "@/components/navigation/AppHeader";
import { DailyUsageDisplay } from "@/components/features/DailyUsageDisplay";
import { RecentChats, useRecentChatIds } from "@/components/navigation/RecentChats";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavLink } from "@/components/navigation/NavLink";

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  iconClassName?: string;
  iconWrapperClassName?: string;
  textClassName?: string;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { role } = useAuthStore();
  const { isMobile, setOpenMobile } = useSidebar();
  const { getUserName } = useUserUtils();
  const { openModal } = useSettingsModal();
  const recentChatIds = useRecentChatIds();

  // Check if current route is a request detail page
  const requestDetailMatch = location.pathname.match(/^\/platform\/history\/(.+)$/);
  const currentRequestId = requestDetailMatch ? requestDetailMatch[1] : null;
  
  // History is active if:
  // 1. We're on /platform/history exactly, OR
  // 2. We're on a request detail page but the request is NOT in recent chats
  const isHistoryActive = 
    location.pathname === "/platform/history" ||
    (currentRequestId !== null && !recentChatIds.includes(currentRequestId));

  const navMain: NavItem[] = [
    {
      title: "New Analysis",
      url: "/platform",
      icon: Plus,
      iconClassName: "text-white !text-white size-4",
      iconWrapperClassName: "bg-primary rounded-full flex items-center justify-center size-4 shrink-0",
      textClassName: "text-primary",
      isActive: false, // Never show active state for New Analysis
    },
    {
      title: "History",
      url: "/platform/history",
      icon: MessagesSquare,
      isActive: isHistoryActive,
    },
    {
      title: "Usage",
      url: "/platform/usage",
      icon: Sparkles,
      isActive: location.pathname === "/platform/usage",
    }
  ];

  const navAdmin: NavItem[] = [
    {
      title: "Prompts",
      url: "/admin/prompts",
      icon: FileText,
      isActive: location.pathname === "/admin/prompts" || location.pathname.startsWith("/admin/prompts/"),
    },
    {
      title: "Requests",
      url: "/admin/requests",
      icon: ListChecks,
      isActive: location.pathname === "/admin/requests" || location.pathname.startsWith("/admin/requests/"),
    }
  ];

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppHeader />
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <div className="shrink-0">
          <NavMain items={navMain} title="Menu" />
          {role === "admin" && (
            <NavMain items={navAdmin} title="Admin" />
          )}
        </div>
        <ScrollArea className="flex-1 min-h-0">
          <div className="pr-2">
            <RecentChats />
          </div>
        </ScrollArea>
        <div className="shrink-0 px-2">
          <DailyUsageDisplay compact />
        </div>
      </SidebarContent>
      <SidebarFooter>
        
        
        <NavUser
          user={{
            name: getUserName(),
            email: user?.email || "",
          }}
          onLogout={signOut}
          onNavigate={navigate}
          onOpenSettings={openModal}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
