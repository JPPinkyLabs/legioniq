import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, AlertCircle, User, BadgeCheck } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useUserUtils } from "@/hooks/auth/useUserUtils";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditNameModal } from "./components/EditNameModal";
import { UserStats } from "./components/UserStats";
import { UserPreferencesSection } from "./components/UserPreferencesSection";
import { SecuritySection } from "./components/SecuritySection";
import { DeleteAccountModal } from "./components/DeleteAccountModal";
import { ChangePasswordModal } from "./components/ChangePasswordModal";
import { ResetPreferencesModal } from "./components/ResetPreferencesModal";
import { AccountSkeleton } from "@/components/skeletons/AccountSkeleton";
import { ErrorEmpty } from "@/components/ErrorEmpty";
import { AvatarWithActions } from "./components/AvatarWithActions";
import { ScrollArea } from "@/components/ui/scroll-area";

const Account = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { getUserInitials, getJoinDate, getUserName } = useUserUtils();
  const { role } = useAuthStore();
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isResetPreferencesModalOpen, setIsResetPreferencesModalOpen] = useState(false);

  const BackButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate("/platform")}
      className="text-muted-foreground hover:text-foreground -ml-2"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  );

  return (
    <ScrollArea className="h-full">
      <div className="px-5 mx-4 md:mx-6 lg:mx-8 max-w-5xl md:max-w-5xl lg:max-w-5xl xl:max-w-5xl 2xl:max-w-8xl 2xl:mx-auto py-3">
        <div className="space-y-6">
        <div className="space-y-3">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account information and preferences
            </p>
          </div>
        </div>

        {loading ? (
          <AccountSkeleton />
        ) : !user ? (
          <ErrorEmpty
            icon={AlertCircle}
            title="Error loading account data"
            description="Failed to load your account information. Please try again."
          />
        ) : (
          <>

            {/* Profile Card */}
            <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your account details and identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <AvatarWithActions />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-lg">{getUserName()}</p>
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                  {role === "admin" && (
                    <Badge variant="secondary">
                      Admin
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsNameModalOpen(true)}
                    className="h-6 w-6"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground"> Joined {getJoinDate()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <UserStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserPreferencesSection onResetClick={() => setIsResetPreferencesModalOpen(true)} />

          <SecuritySection
            onDeleteClick={() => setIsDeleteModalOpen(true)}
            onChangePasswordClick={() => setIsChangePasswordModalOpen(true)}
          />
        </div>
          </>
        )}
        </div>
      </div>

      <EditNameModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      <ResetPreferencesModal
        isOpen={isResetPreferencesModalOpen}
        onClose={() => setIsResetPreferencesModalOpen(false)}
      />
    </ScrollArea>
  );
};

export default Account;

