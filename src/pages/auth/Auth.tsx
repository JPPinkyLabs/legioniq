import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/auth/useAuth";
import SignInForm from "./components/SignInForm";
import SignUpForm from "./components/SignUpForm";
import AuthHeader from "./components/AuthHeader";
import AuthFooter from "./components/AuthFooter";
import AuthSidebar from "./components/AuthSidebar";
import { PendingApprovalModal } from "./components/PendingApprovalModal";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp } = useAuth();
  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    if (searchParams.get('pending') === 'true') {
      setShowPendingModal(true);
      navigate('/auth', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSignIn = async (data: Parameters<typeof signIn>[0]) => {
    const result = await signIn(data);
    if (result.success && result.isApproved === false) {
      setShowPendingModal(true);
    }
    return result;
  };

  const handleSignUp = async (data: Parameters<typeof signUp>[0]) => {
    const result = await signUp(data);
    if (result.success && result.isApproved === false) {
      setShowPendingModal(true);
    }
    return result;
  };

  return (
    <div className="min-h-screen h-screen w-full lg:grid lg:grid-cols-2 lg:items-stretch relative">
      <div className="absolute top-0 left-0 px-4 py-3 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 lg:h-full">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <AuthHeader />

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <SignInForm onSubmit={handleSignIn} />
            </TabsContent>

            <TabsContent value="signup">
              <SignUpForm onSubmit={handleSignUp} />
            </TabsContent>
          </Tabs>

          <AuthFooter />
        </div>
      </div>

      <AuthSidebar />

      <PendingApprovalModal
        isOpen={showPendingModal}
        onClose={() => setShowPendingModal(false)}
      />
    </div>
  );
};

export default Auth;

