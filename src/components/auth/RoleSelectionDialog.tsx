import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/api";
import { Check, Store, ShoppingBag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleSelectionDialogProps {
  open: boolean;
  onConfirm: (role: UserRole) => void;
  isLoading: boolean;
}

export function RoleSelectionDialog({ open, onConfirm, isLoading }: RoleSelectionDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleConfirm = () => {
    if (selectedRole) {
      onConfirm(selectedRole);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md [&>button]:hidden"> 
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold font-heading">Choose your journey</DialogTitle>
          <DialogDescription>
            Select how you want to use SteerSolo to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div
            onClick={() => setSelectedRole(UserRole.ENTREPRENEUR)}
            className={cn(
              "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-muted/50",
              selectedRole === UserRole.ENTREPRENEUR
                ? "border-primary bg-primary/5 shadow-md"
                : "border-muted hover:border-primary/50"
            )}
          >
            <div className={cn(
              "p-3 rounded-lg transition-colors",
              selectedRole === UserRole.ENTREPRENEUR ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              <Store className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground">Entrepreneur</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage my own shop. Sell products and grow your business.
              </p>
            </div>
            {selectedRole === UserRole.ENTREPRENEUR && (
              <div className="absolute top-4 right-4 text-primary animate-in zoom-in spin-in-180">
                <Check className="w-5 h-5" />
              </div>
            )}
          </div>

          <div
            onClick={() => setSelectedRole(UserRole.CUSTOMER)}
            className={cn(
              "relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-muted/50",
              selectedRole === UserRole.CUSTOMER
                ? "border-primary bg-primary/5 shadow-md"
                : "border-muted hover:border-primary/50"
            )}
          >
            <div className={cn(
              "p-3 rounded-lg transition-colors",
              selectedRole === UserRole.CUSTOMER ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground">Customer</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Browse and shop from a variety of unique stores.
              </p>
            </div>
            {selectedRole === UserRole.CUSTOMER && (
              <div className="absolute top-4 right-4 text-primary animate-in zoom-in spin-in-180">
                <Check className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-2">
          <Button
            className="w-full bg-gradient-to-r from-primary to-accent py-6 text-lg"
            onClick={handleConfirm}
            disabled={!selectedRole || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Setting up account...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
