import { useState, useEffect, useCallback } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { AppBreadcrumb } from "@/components/navigation/AppBreadcrumb";
import { useOnboardingStatus } from "@/hooks/auth/useOnboardingStatus";
import { OnboardingOverlay } from "@/components/onboarding/OnboardingOverlay";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Loader2, Sun, Moon } from "lucide-react";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const { hasCompletedOnboarding, isLoading } = useOnboardingStatus();
  const { theme, toggleTheme } = useTheme();
  const [showOnboardingOverlay, setShowOnboardingOverlay] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasCheckedOnboarding) {
      setHasCheckedOnboarding(true);
      if (!hasCompletedOnboarding) {
        setShowOnboardingOverlay(true);
      }
    }
  }, [isLoading, hasCompletedOnboarding, hasCheckedOnboarding]);

  // Update overlay visibility when onboarding status changes
  useEffect(() => {
    if (hasCompletedOnboarding && showOnboardingOverlay) {
      setShowOnboardingOverlay(false);
    } else if (!hasCompletedOnboarding && !showOnboardingOverlay && hasCheckedOnboarding) {
      // Show overlay if onboarding is marked as incomplete (e.g., after reset)
      setShowOnboardingOverlay(true);
    }
  }, [hasCompletedOnboarding, showOnboardingOverlay, hasCheckedOnboarding]);

  // Memoized callback to prevent re-renders
  const handleOnboardingComplete = useCallback(() => {
    setShowOnboardingOverlay(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className={`flex h-screen w-full overflow-hidden transition-opacity duration-300 ${
        showOnboardingOverlay ? "pointer-events-none opacity-50" : ""
      }`}>
        <AppSidebar />

        <div className="flex flex-col flex-1 w-full min-w-0 overflow-hidden">
          <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-40 bg-background/80 flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-4 hidden md:block" />
                <div className="hidden md:block">
                  <AppBreadcrumb />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-8 w-8"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto min-h-0">
            {children}
          </main>
        </div>
      </div>

      {showOnboardingOverlay && (
        <OnboardingOverlay onComplete={handleOnboardingComplete} />
      )}
    </SidebarProvider>
  );
};

export default AuthenticatedLayout;
