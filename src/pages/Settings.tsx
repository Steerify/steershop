import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageWrapper } from "@/components/PageWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteAccountDialog } from "@/components/auth/DeleteAccountDialog";
import { ArrowLeft, User, Shield, Bell, Key } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <PageWrapper patternVariant="dots" patternOpacity={0.4}>
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-2xl relative z-10">
        <div className="mb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="mb-4 hover:bg-primary/10 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Profile Section */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Account Profile</CardTitle>
              </div>
              <CardDescription>Your basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Name</p>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Account Type</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
            </CardContent>
          </Card>

          {/* Security & Privacy */}
          <Card className="border-border/50 shadow-sm opacity-60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Security</CardTitle>
              </div>
              <CardDescription>Manage password and authentication (Coming soon)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pointer-events-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Change Password</span>
                </div>
                <Button variant="ghost" size="sm" disabled>Update</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Notifications</span>
                </div>
                <Button variant="ghost" size="sm" disabled>Manage</Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Permanent actions affecting your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Delete Account</p>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <DeleteAccountDialog />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Settings;
