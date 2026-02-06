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
import { Loader2, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import { UserRole } from "@/types/api";

interface DeleteAccountDialogProps {
  isShopOwner?: boolean;
}

export function DeleteAccountDialog({ isShopOwner = false }: DeleteAccountDialogProps) {
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
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }

      const { data, error } = await supabase.functions.invoke("delete-account");

      if (error) throw error;

      toast({
        title: "Account deleted",
        description: "Your account and data have been permanently removed.",
      });

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
          <AlertDialogDescription className="space-y-4" asChild>
            <div>
              <p className="text-foreground font-medium">
                This action is permanent and cannot be undone.
              </p>
              <p className="text-sm">
                All your data, including your profile, shop information, products, 
                and order history will be permanently deleted from our servers.
              </p>

              {isShopOwner && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg space-y-1">
                  <p className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Shop Owner Warning
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your store, all products, customer orders, revenue history, and booking data 
                    will be permanently deleted. Customers will no longer be able to access your store.
                  </p>
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-900">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  ⚠️ You will never be able to create a new account with this email address.
                </p>
              </div>

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
