import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ResponsiveDropdown } from "@/components/ui/responsive-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, Settings, LogOut, Home, Sun, Moon } from "lucide-react";
import { useIsMobile } from "@/hooks/other/use-mobile";
import { useAuth } from "@/hooks/auth/useAuth";
import { useUserUtils } from "@/hooks/auth/useUserUtils";
import { useAvatarUrl } from "@/hooks/avatar/useAvatarUrl";
import { Link, useNavigate } from "react-router-dom";
import legionLogo from "@/assets/legioniq-logo.png";
import legionLogoGolden from "@/assets/legionIQ_logo_golden.png";
import { useTheme } from "@/contexts/ThemeContext";

export function Header() {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();
  const logo = theme === "dark" ? legionLogoGolden : legionLogo;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleDashboardClick = () => {
    navigate("/platform");
  };

  const handleAccountClick = () => {
    navigate("/platform/account");
  };

  const { getUserInitials, getUserName } = useUserUtils();
  const { avatarUrl, handleImageError } = useAvatarUrl();

  return (
    <header>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="LegionIQ Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold">LegionIQ</span>
          </Link>
        </div>

        {user ? (
          <div className="flex items-center space-x-4">
            {!isMobile && (
              <Button onClick={handleDashboardClick} variant="ghost">
                Platform
              </Button>
            )}
            <ResponsiveDropdown
              trigger={
                <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-accent cursor-pointer transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={avatarUrl || undefined} 
                      alt={getUserName()}
                      onError={handleImageError}
                    />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  {!isMobile && (
                    <span className="text-sm font-medium">{getUserName()}</span>
                  )}
                </button>
              }
              items={[
                {
                  label: "Account",
                  icon: <User className="h-4 w-4" />,
                  onClick: handleAccountClick,
                },
                {
                  label: theme === "light" ? "Dark Mode" : "Light Mode",
                  icon: theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />,
                  onClick: toggleTheme,
                  separator: true,
                },
                {
                  label: "Log out",
                  icon: <LogOut className="h-4 w-4" />,
                  onClick: handleLogout,
                  variant: 'destructive',
                },
              ]}
              align="end"
            />
          </div>
        ) : (
          <>
            {!isMobile && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-9 w-9"
                  aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
                <Button asChild>
                  <Link to="/auth">Create account or login</Link>
                </Button>
              </div>
            )}

            {isMobile && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-9 w-9"
                  aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[400px] w-[90vw]">
                    <DialogHeader>
                      <DialogTitle>Navigation Menu</DialogTitle>
                      <DialogDescription>
                        Sign in or sign up to access LegionIQ
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Button asChild className="w-full justify-start h-12 text-base font-medium">
                          <Link to="/auth">Create account or login</Link>
                        </Button>
                      </div>
                    </div>

                    <div className="pt-6 border-t">
                      <p className="text-xs text-muted-foreground text-center">
                        © 2025 LegionIQ
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}

