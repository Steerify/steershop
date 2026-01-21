import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import '@/types/google';

export function DeleteAccountDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

  const handleDelete = async () => {
    if (phrase !== CONFIRMATION_PHRASE) return;

    setIsDeleting(true);
    try {
      // Disable Google auto-select BEFORE deleting account
      // This prevents Google from remembering and auto-suggesting this account
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }

      // Call the edge function to delete the account
      const { data, error } = await supabase.functions.invoke("delete-account");

      if (error) throw error;

      toast({
        title: "Account deleted",
        description: "Your account and data have been permanently removed.",
      });

      // Log out and redirect
      await signOut();
      navigate("/");
    } catch (error: any) {
      console.error("Deletion error:", error);
      toast({
        title: "Deletion failed",
        description: error.message || "An error occurred while deleting your account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="w-6 h-6" />
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-4">
            <p className="text-foreground font-medium">
              This action is permanent and cannot be undone.
            </p>
            <p className="text-sm">
              All your data, including your profile, shop information, products, 
              and order history will be permanently deleted from our servers. 
              You will no longer be able to log in with this account or use Google login 
              to access this specific identity.
            </p>
            <div className="space-y-3 pt-2">
              <Label htmlFor="phrase" className="text-sm font-semibold">
                Type <span className="text-destructive font-mono">"{CONFIRMATION_PHRASE}"</span> to confirm:
              </Label>
              <Input
                id="phrase"
                placeholder={CONFIRMATION_PHRASE}
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                autoComplete="off"
                className="font-mono"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel onClick={() => setPhrase("")}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={phrase !== CONFIRMATION_PHRASE || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Permanently Delete My Account"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
