import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  password: string;
  name: string;
}

export type AuthFormData = SignInFormData | SignUpFormData;

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  isSigningUp: boolean;
  avatarUrl: string | null;
  profileUpdatedAt: string | null;
  avatarUrlGeneratedAt: number | null;
  role: string | null;
  
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setAvatarUrl: (url: string | null) => void;
  setRole: (role: string | null) => void;
  loadAvatarUrl: (forceRefresh?: boolean, profileData?: { avatar_url: string | null; updated_at: string | null; created_at: string | null }) => Promise<void>;
  initialize: () => Promise<void>;
  signIn: (data: SignInFormData) => Promise<{ success: boolean; error?: string; isApproved?: boolean }>;
  signUp: (data: SignUpFormData) => Promise<{ success: boolean; error?: string; isApproved?: boolean }>;
  signOut: () => Promise<void>;
  clearAuth: () => void;
  checkUserApproval: (userId: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      loading: true,
      initialized: false,
      isSigningUp: false,
      avatarUrl: null,
      profileUpdatedAt: null,
      avatarUrlGeneratedAt: null,
      role: null,

      setSession: (session) => {
        set({ session, user: session?.user ?? null });
      },

      setUser: (user) => {
        set({ user });
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setAvatarUrl: (url) => {
        set({ avatarUrl: url });
      },

      setRole: (role) => {
        set({ role });
      },

      loadAvatarUrl: async (forceRefresh = false, profileData?: { avatar_url: string | null; updated_at: string | null; created_at: string | null }) => {
        const { user } = get();
        if (!user?.id) {
          set({ avatarUrl: null, profileUpdatedAt: null, avatarUrlGeneratedAt: null });
          return;
        }

        try {
          // Use provided profile data if available, otherwise fetch from database
          let profile: { avatar_url: string | null; updated_at: string | null; created_at: string | null } | null = profileData || null;
          
          if (!profile) {
            // Only fetch if no profile data was provided
            const { data, error } = await supabase
              .from("profiles")
              .select("avatar_url, updated_at, created_at")
              .eq("id", user.id)
              .single();

            if (error) {
              if (error.code === "PGRST116") {
                // Profile doesn't exist
                set({ avatarUrl: null, profileUpdatedAt: null, avatarUrlGeneratedAt: null });
                return;
              }
              console.error("Error fetching profile for avatar:", error);
              set({ avatarUrl: null, profileUpdatedAt: null, avatarUrlGeneratedAt: null });
              return;
            }
            profile = data;
          }

          if (!profile?.avatar_url) {
            set({ 
              avatarUrl: null, 
              profileUpdatedAt: profile?.updated_at || profile?.created_at || null,
              avatarUrlGeneratedAt: null
            });
            return;
          }

          const profileUpdatedAt = profile.updated_at || profile.created_at || "";
          
          // Check if profile was updated since last load
          const currentUpdatedAt = get().profileUpdatedAt;
          const currentAvatarUrl = get().avatarUrl;
          const currentGeneratedAt = get().avatarUrlGeneratedAt;
          
          // Check if current URL is a signed URL from Supabase Storage (contains signature)
          const isSignedUrl = currentAvatarUrl?.includes("?") && 
                             (currentAvatarUrl.includes("token=") || currentAvatarUrl.includes("signature="));
          
          // Check if signed URL might be expired (generated more than 50 minutes ago, URLs expire in 1 hour)
          const isExpired = currentGeneratedAt && (Date.now() - currentGeneratedAt > 50 * 60 * 1000);
          
          // If profile hasn't changed and we have a valid non-expired avatarUrl, skip refresh unless forced
          if (!forceRefresh && 
              currentUpdatedAt === profileUpdatedAt && 
              currentAvatarUrl && 
              (!isSignedUrl || !isExpired)) {
            // Profile hasn't changed and URL is still valid, keep existing avatarUrl
            return;
          }

          // Generate signed URL for private storage
          const urlParts = profile.avatar_url.split("/avatars/");
          
          if (urlParts.length === 2) {
            const filePath = urlParts[1];
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from("avatars")
              .createSignedUrl(filePath, 3600);

            if (signedUrlError) {
              console.error("Error creating signed URL:", signedUrlError);
              // Fallback to original URL
              set({ 
                avatarUrl: profile.avatar_url, 
                profileUpdatedAt: profileUpdatedAt,
                avatarUrlGeneratedAt: Date.now()
              });
              return;
            }

            set({ 
              avatarUrl: signedUrlData.signedUrl, 
              profileUpdatedAt: profileUpdatedAt,
              avatarUrlGeneratedAt: Date.now()
            });
          } else {
            // If it's not a storage URL, use it directly
            set({ 
              avatarUrl: profile.avatar_url, 
              profileUpdatedAt: profileUpdatedAt,
              avatarUrlGeneratedAt: Date.now()
            });
          }
        } catch (error) {
          console.error("Error loading avatar URL:", error);
          set({ avatarUrl: null, profileUpdatedAt: null, avatarUrlGeneratedAt: null });
        }
      },

      initialize: async () => {
        if (get().initialized) return;

        set({ loading: true, initialized: true });

        try {
          supabase.auth.onAuthStateChange((event, session) => {
            get().setSession(session);
            get().setLoading(false);
            
            if (event === "SIGNED_OUT") {
              get().clearAuth();
            }
          });

          // Get current session from localStorage first
          const { data: { session: localSession } } = await supabase.auth.getSession();
          
          if (!localSession?.access_token) {
            set({ session: null, user: null, loading: false });
            return;
          }

          // Validate session with edge function
          const { data, error } = await supabase.functions.invoke("auth-session", {
            headers: {
              Authorization: `Bearer ${localSession.access_token}`,
            },
          });

          if (error || !data) {
            // Session is invalid - clear local state without calling signOut()
            // to avoid 403 errors from trying to invalidate an already-invalid token
            console.warn("Session validation failed, clearing local state:", error?.message || data?.error);
            get().clearAuth();
            
            // Clear localStorage session manually
            try {
              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
              if (supabaseUrl) {
                const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
                if (projectRef) {
                  localStorage.removeItem(`sb-${projectRef}-auth-token`);
                }
              }
              localStorage.removeItem('auth-storage');
            } catch (localError) {
              // Ignore errors when clearing localStorage
              console.warn("Error clearing localStorage:", localError);
            }
            return;
          }

          // Check if user is not approved
          if (data.isApproved === false) {
            // User not approved - clear local state without calling signOut()
            get().clearAuth();
            
            // Clear localStorage session manually
            try {
              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
              if (supabaseUrl) {
                const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
                if (projectRef) {
                  localStorage.removeItem(`sb-${projectRef}-auth-token`);
                }
              }
              localStorage.removeItem('auth-storage');
            } catch (localError) {
              // Ignore errors when clearing localStorage
              console.warn("Error clearing localStorage:", localError);
            }
            return;
          }

          if (data.session && data.user && data.isApproved) {
            // Set session in Supabase client
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token || localSession.refresh_token,
            });

            const { data: { session: updatedSession } } = await supabase.auth.getSession();
            
            if (updatedSession) {
              set({ 
                session: updatedSession, 
                user: updatedSession.user ?? null, 
                loading: false 
              });
              
              // Set role from response
              if (data.role) {
                get().setRole(data.role);
              }
              
              // Always verify and refresh avatar URL after initialization
              // This ensures signed URLs are regenerated if expired
              get().loadAvatarUrl().catch((error) => {
                console.error("Error loading avatar URL in background:", error);
              });
            } else {
              set({ session: null, user: null, loading: false });
            }
          } else {
            set({ session: null, user: null, loading: false });
          }
        } catch (error) {
          console.error("Error initializing auth:", error);
          // On error, clear state without calling signOut()
          get().clearAuth();
        }
      },

      signIn: async (data: SignInFormData) => {
        try {
          const { data: responseData, error } = await supabase.functions.invoke("auth-sign-in", {
            body: {
              email: data.email,
              password: data.password,
            },
          });

          if (error) {
            throw new Error(error.message || "Failed to sign in");
          }

          if (!responseData.success) {
            throw new Error(responseData.error || "Failed to sign in");
          }

          if (responseData.isApproved === false) {
            get().clearAuth();
            // Set role even if not approved
            if (responseData.role) {
              get().setRole(responseData.role);
            }
            return { success: true, isApproved: false };
          }

          if (responseData.session && responseData.user) {
            // Set session in Supabase client
            await supabase.auth.setSession({
              access_token: responseData.session.access_token,
              refresh_token: responseData.session.refresh_token,
            });

            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
              set({ session, user: session.user });
              
              // Set role from response
              if (responseData.role) {
                get().setRole(responseData.role);
              }
              
              // Load avatar URL after successful sign in (will use cached if available)
              get().loadAvatarUrl().catch((error) => {
                console.error("Error loading avatar URL:", error);
              });
              
              toast.success("Welcome back!", {
                description: "You have successfully logged in.",
              });

              return { success: true, isApproved: true };
            }
          }

          return { success: false, error: "No session created" };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "An error occurred while logging in.";
          toast.error("Error", {
            description: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      signUp: async (data: SignUpFormData) => {
        try {
          set({ isSigningUp: true });
          
          const { data: responseData, error } = await supabase.functions.invoke("auth-sign-up", {
            body: {
              email: data.email,
              password: data.password,
              name: data.name,
            },
          });

          if (error) {
            set({ isSigningUp: false });
            throw new Error(error.message || "Failed to create account");
          }

          if (!responseData.success) {
            set({ isSigningUp: false });
            throw new Error(responseData.error || "Failed to create account");
          }

          if (responseData.isApproved === false) {
            get().clearAuth();
            set({ isSigningUp: false });
            // Set role even if not approved
            if (responseData.role) {
              get().setRole(responseData.role);
            }
            
            toast.success("Account created!", {
              description: "Your account has been created successfully.",
            });

            return { success: true, isApproved: false };
          }

          if (responseData.session && responseData.user) {
            // Set session in Supabase client
            await supabase.auth.setSession({
              access_token: responseData.session.access_token,
              refresh_token: responseData.session.refresh_token,
            });

            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
              set({ session, user: session.user, isSigningUp: false });

              // Set role from response
              if (responseData.role) {
                get().setRole(responseData.role);
              }

              // Load avatar URL after successful sign up (will use cached if available)
              get().loadAvatarUrl().catch((error) => {
                console.error("Error loading avatar URL:", error);
              });

              toast.success("Account created!", {
                description: "Your account has been created successfully.",
              });

              return { success: true, isApproved: true };
            }
          }

          set({ isSigningUp: false });

          toast.success("Account created!", {
            description: "Your account has been created successfully.",
          });

          return { success: true, isApproved: false };
        } catch (error: unknown) {
          set({ isSigningUp: false });
          const errorMessage = error instanceof Error ? error.message : "An error occurred while creating your account.";
          toast.error("Error", {
            description: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      signOut: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          // Clear local state first to prevent any race conditions
          get().clearAuth();
          
          if (session?.access_token) {
            // Call edge function to sign out on server (non-blocking)
            // Don't await to avoid blocking if it fails
            supabase.functions.invoke("auth-sign-out", {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }).catch((functionError) => {
              // Silently handle edge function errors - local logout already happened
              console.warn("Edge function sign-out error (non-critical):", functionError);
            });
          }

          // Clear Supabase session from localStorage without calling signOut()
          // This avoids the 403 error from trying to invalidate an already-invalidated token
          try {
            // Remove Supabase auth session from localStorage
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            if (supabaseUrl) {
              const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
              if (projectRef) {
                localStorage.removeItem(`sb-${projectRef}-auth-token`);
              }
            }
            // Also clear our auth storage
            localStorage.removeItem('auth-storage');
          } catch (localError) {
            // Ignore errors when clearing localStorage
            console.warn("Error clearing localStorage (non-critical):", localError);
          }

          toast.success("Logged out", {
            description: "You have been successfully logged out.",
          });
        } catch (error: unknown) {
          // Even if everything fails, ensure local state is cleared
          get().clearAuth();
          
          const errorMessage = error instanceof Error ? error.message : "An error occurred while logging out.";
          toast.error("Error", {
            description: errorMessage,
          });
        }
      },

      clearAuth: () => {
        set({ 
          session: null, 
          user: null, 
          loading: false,
          isSigningUp: false,
          avatarUrl: null,
          profileUpdatedAt: null,
          avatarUrlGeneratedAt: null,
          role: null
        });
      },

      checkUserApproval: async (userId: string) => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          const { data, error } = await supabase.functions.invoke("auth-check-approval", {
            body: { userId },
            headers: session?.access_token ? {
              Authorization: `Bearer ${session.access_token}`,
            } : undefined,
          });

          if (error) {
            console.error("Error checking user approval:", error);
            return false;
          }

          return data?.isApproved ?? false;
        } catch (error) {
          console.error("Error checking user approval:", error);
          return false;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
        user: state.user,
        avatarUrl: state.avatarUrl,
        profileUpdatedAt: state.profileUpdatedAt,
        avatarUrlGeneratedAt: state.avatarUrlGeneratedAt,
        role: state.role,
      }),
    }
  )
);


