import legionLogo from "@/assets/legioniq-logo.png";
import legionLogoGolden from "@/assets/legionIQ_logo_golden.png";
import packageJson from "../../../package.json";
import { useTheme } from "@/contexts/ThemeContext";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppHeader() {
  const { theme } = useTheme();
  const logo = theme === "dark" ? legionLogoGolden : legionLogo;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <img 
              src={logo} 
              alt="LegionIQ" 
              className="size-5 object-contain"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">LegionIQ v{packageJson.version}</span>
            <span className="truncate text-xs">
              ©{' '}
              <a
                href="https://pinkylabs.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                PINKY LABS LLC
              </a>
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
