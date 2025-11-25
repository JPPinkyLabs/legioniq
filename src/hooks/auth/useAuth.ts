import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type SignInFormData, type SignUpFormData } from "@/stores/authStore";


export const useAuth = () => {
  const navigate = useNavigate();
  const {
    session,
    user,
    loading,
    initialized,
    initialize,
    signIn: storeSignIn,
    signUp: storeSignUp,
    signOut: storeSignOut,
  } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  const signIn = async (data: SignInFormData) => {
    const result = await storeSignIn(data);
    if (result.success) {
      if (result.isApproved === false) {
        return result;
      } else {
        navigate("/platform");
      }
    }
    return result;
  };

  const signUp = async (data: SignUpFormData) => {
    const result = await storeSignUp(data);
    if (result.success) {
      if (result.isApproved === false) {
        return result;
      } else {
        navigate("/platform");
      }
    }
    return result;
  };

  const signOut = async () => {
    await storeSignOut();
    navigate("/auth");
  };

  return {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};

export type { SignInFormData, SignUpFormData };

