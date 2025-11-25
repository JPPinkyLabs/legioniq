import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Camera, Lock } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function Features() {
  const { theme } = useTheme();
  // Dark theme uses image 1, light theme uses image 2
  const screenshotSrc = theme === "dark" 
    ? "/landing_preview_1.png" 
    : "/landing_preview_2.png";
  return (
    <section className="pt-8 pb-16 px-8">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center gap-8 mb-12">
          <h1 className="mb-0 text-balance font-medium text-5xl tracking-tighter text-center">
            Why choose LegionIQ?
          </h1>
          <p className="mx-auto mt-0 mb-0 max-w-2xl text-balance text-lg text-muted-foreground text-center">
            Discover the features that make LegionIQ the best choice for game analysis.
          </p>
        </div>

        {/* Desktop Device Mockup */}
        <div className="flex justify-center mb-12">
          <div className="relative w-full max-w-4xl">
            {/* Desktop Frame */}
            <div className="relative">
              {/* Screen */}
              <div className="relative bg-gray-900 rounded-t-2xl p-2 shadow-2xl inline-block">
                <div className="bg-background rounded-lg overflow-hidden border-4 border-gray-800">
                  <img
                    src={screenshotSrc}
                    alt="LegionIQ Home Screen"
                    className="block w-full h-auto"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center';
                      fallback.innerHTML = '<div class="text-center p-8"><p class="text-muted-foreground">Home Screenshot</p><p class="text-sm text-muted-foreground mt-2">Add landing_preview images to public folder</p></div>';
                      target.parentElement?.appendChild(fallback);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Cards */}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
                    <Brain className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="mb-0 break-words min-w-0">AI-Powered Analysis</CardTitle>
                </div>
                <CardDescription className="break-words">
                  Advanced AI trained to understand competitive gaming strategies and provide actionable insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
                    <Camera className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="mb-0 break-words min-w-0">Easy Screenshot Upload</CardTitle>
                </div>
                <CardDescription className="break-words">
                  Simply upload your game screenshots and get instant analysis with detailed recommendations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="mb-0 break-words min-w-0">Private & Secure</CardTitle>
                </div>
                <CardDescription className="break-words">
                  Your data is processed securely. No account access, no automation, just pure intelligence.
                </CardDescription>
              </CardHeader>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
