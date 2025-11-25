import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";

export function CTA() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate("/platform");
    } else {
      navigate("/auth");
    }
  };

  return (
    <section className="pt-8 pb-16 px-8">
      <div className="container mx-auto text-center">
        <h1 className="mb-6 text-balance font-medium text-5xl tracking-tighter">
          Ready to improve your gameplay?
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-balance text-lg text-muted-foreground">
          Join players who are already using AI to enhance their competitive edge.
        </p>
        <Button size="lg" onClick={handleGetStarted}>
          Create Free Account
        </Button>
      </div>
    </section>
  );
}

