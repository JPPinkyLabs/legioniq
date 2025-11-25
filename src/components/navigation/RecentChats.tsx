import { useEffect } from "react";
import { useRequests } from "@/hooks/requests/useRequests";
import { useSidebar } from "@/components/ui/sidebar";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { RecentChatsSkeleton } from "@/components/skeletons/RecentChatsSkeleton";
import { NavLink } from "@/components/navigation/NavLink";
import { Tables } from "@/integrations/supabase/types";

type Request = Tables<"requests">;

interface ChatItemProps {
  title: string;
  requestId: string;
}

const ChatItem = ({ title, requestId }: ChatItemProps) => {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={`/platform/history/requests/${requestId}`}
          activeClassName="bg-gray-200 dark:bg-[hsl(0,0%,8%)] text-foreground font-medium"
          className="w-full justify-start h-auto py-2 px-2 hover:bg-gray-200 dark:hover:bg-[hsl(0,0%,8%)] hover:text-foreground transition-colors overflow-hidden"
          onClick={handleLinkClick}
        >
          <span className="text-sm font-medium truncate text-left block max-w-[180px]">{title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

// Export hook to get recent chat IDs for use in other components
export const useRecentChatIds = () => {
  const { requests } = useRequests();
  return requests.map((request) => request.id);
};

export const RecentChats = () => {
  const { state, isMobile } = useSidebar();
  const { requests, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useRequests();

  // Auto-fetch all pages to fill the sidebar
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Hide component only when sidebar is collapsed (icon mode on desktop)
  // On mobile, always show when sidebar is open (Sheet)
  if (!isMobile && state === "collapsed") {
    return null;
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Recent</SidebarGroupLabel>
        <RecentChatsSkeleton />
      </SidebarGroup>
    );
  }

  if (requests.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Recent</SidebarGroupLabel>
      <SidebarMenu>
        {requests.map((request) => {
          // Use category label, advice name, and ID from the joined data
          const categoryLabel = request.category?.label || "Untitled";
          const adviceName = request.advice?.name;
          const requestId = request.id;
          const categoryWithAdvice = adviceName 
            ? `${categoryLabel} (${adviceName})` 
            : categoryLabel;
          const title = `${categoryWithAdvice} - ${requestId}`;

          return (
            <ChatItem
              key={request.id}
              title={title}
              requestId={request.id}
            />
          );
        })}
      </SidebarMenu>
      {/* Show skeletons while loading more pages */}
      {isFetchingNextPage && (
        <RecentChatsSkeleton count={5} />
      )}
    </SidebarGroup>
  );
};

