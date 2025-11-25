import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/navigation/NavLink";

interface NavMainProps {
  items: {
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
  }[];
  title?: string;
}

export function NavMain({ items, title = "Menu" }: NavMainProps) {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = item.items && item.items.length > 0;
          
          if (hasSubItems) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && (
                        item.iconWrapperClassName ? (
                          <span className={item.iconWrapperClassName}>
                            <item.icon className={item.iconClassName || ""} />
                          </span>
                        ) : (
                          <item.icon className={item.iconClassName} />
                        )
                      )}
                      <span className={item.textClassName}>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink
                              to={subItem.url}
                              activeClassName="bg-gray-200 dark:bg-[hsl(0,0%,8%)] text-foreground font-medium"
                              className="w-full hover:bg-gray-200 dark:hover:bg-[hsl(0,0%,8%)] hover:text-foreground transition-colors"
                              onClick={handleLinkClick}
                            >
                              <span>{subItem.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }
          
          // If isActive is explicitly provided, use it instead of NavLink's automatic detection
          const useCustomActive = item.isActive !== undefined;
          
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink
                  to={item.url}
                  end={useCustomActive ? false : (item.url === "/platform" || item.url === "/platform/history")}
                  activeClassName={
                    useCustomActive 
                      ? "" 
                      : (item.url === "/platform" ? "" : "bg-gray-200 dark:bg-[hsl(0,0%,8%)] text-foreground font-medium")
                  }
                  className={`w-full hover:bg-gray-200 dark:hover:bg-[hsl(0,0%,8%)] hover:text-foreground transition-colors ${
                    useCustomActive && item.isActive && item.url !== "/platform" ? "bg-gray-200 dark:bg-[hsl(0,0%,8%)] text-foreground font-medium" : ""
                  }`}
                  onClick={handleLinkClick}
                >
                  {item.icon && (
                    item.iconWrapperClassName ? (
                      <span className={item.iconWrapperClassName}>
                        <item.icon className={item.iconClassName || ""} />
                      </span>
                    ) : (
                      <item.icon className={item.iconClassName} />
                    )
                  )}
                  <span className={item.textClassName}>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
