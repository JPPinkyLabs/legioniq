import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import legionLogo from "@/assets/legioniq-logo.png";
import { PrivacyContent } from "@/components/legal/PrivacyContent";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <img 
              src={legionLogo} 
              alt="LegionIQ Logo" 
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-xl font-bold">LegionIQ</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <PrivacyContent variant="page" />
      </main>
    </div>
  );
};

export default Privacy;