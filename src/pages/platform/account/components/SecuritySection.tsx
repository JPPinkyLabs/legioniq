import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Trash2, Key } from "lucide-react";

interface SecuritySectionProps {
  onDeleteClick: () => void;
  onChangePasswordClick: () => void;
}

export const SecuritySection = ({ onDeleteClick, onChangePasswordClick }: SecuritySectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security
        </CardTitle>
        <CardDescription>
          Manage your account security settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-2">Change Password</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Update your account password to keep your account secure.
            </p>
            <Button
              variant="outline"
              onClick={onChangePasswordClick}
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              Change Password
            </Button>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold mb-2">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={onDeleteClick}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

