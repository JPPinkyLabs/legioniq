import Lottie from "lottie-react";
import aiLogoAnimation from "@/assets/ai_logo.json";

export function AnalysisOverlayLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="h-48 w-48">
        <Lottie 
          animationData={aiLogoAnimation} 
          loop={true}
          className="w-full h-full"
        />
      </div>
      <div className="text-center space-y-1">
        <p className="text-lg font-medium text-foreground">
          Analyzing your screenshots...
        </p>
        <p className="text-sm text-muted-foreground">
          This may take a few moments
        </p>
      </div>
    </div>
  );
}

