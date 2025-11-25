import { Sparkles } from "lucide-react";

export function OnboardingLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        <Sparkles 
          className="h-14 w-14 text-primary" 
          style={{
            animation: "bounce 1.2s ease-in-out infinite",
          }}
        />
      </div>
      <div className="text-center space-y-2 max-w-sm">
        <p className="text-base font-medium text-foreground">
          Preparing everything for the best user experience
        </p>
        <p className="text-sm text-muted-foreground">
          Please wait a moment...
        </p>
      </div>
    </div>
  );
}

