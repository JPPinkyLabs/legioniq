import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToPlatform = () => {
    navigate("/platform");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-2xl mx-auto space-y-6">
        {/* 404 Number with gradient effect */}
        <div className="relative">
          <h1 className="text-6xl md:text-7xl font-bold mb-0 leading-none">
            <span className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
              404
            </span>
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" />
          </div>
        </div>

        {/* Main message */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Page Not Found
          </h2>
          <p className="mx-auto max-w-xl text-base md:text-lg text-muted-foreground">
            Oops! The page you're looking for doesn't exist or has been moved.
            <br />
            Let's get you back on track.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            size="lg" 
            onClick={handleGoHome}
            className="w-full sm:w-auto"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleGoBack}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          {user && (
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleGoToPlatform}
              className="w-full sm:w-auto"
            >
              Go to Platform
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
