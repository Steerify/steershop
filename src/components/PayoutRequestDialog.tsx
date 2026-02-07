import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { payoutService } from "@/services/payout.service";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Banknote, AlertCircle } from "lucide-react";

interface PayoutRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  availableBalance: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  onSuccess: () => void;
}

const MIN_WITHDRAWAL = 5000;

export const PayoutRequestDialog = ({
  isOpen, onClose, shopId, availableBalance, bankName, accountNumber, accountName, onSuccess
}: PayoutRequestDialogProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bank_name: bankName || "",
    account_number: accountNumber || "",
    account_name: accountName || "",
  });

  const handleSubmit = async () => {
    const amountNum = Number(amount);
    if (amountNum < MIN_WITHDRAWAL) {
      toast({ title: "Minimum ₦5,000", description: `Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString()}`, variant: "destructive" });
      return;
    }
    if (amountNum > availableBalance) {
      toast({ title: "Insufficient Balance", description: "Amount exceeds available balance", variant: "destructive" });
      return;
    }
    if (!bankDetails.bank_name || !bankDetails.account_number || !bankDetails.account_name) {
      toast({ title: "Missing Details", description: "Please fill in all bank details", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await payoutService.requestPayout({
        shop_id: shopId,
        amount: amountNum,
        ...bankDetails,
      });
      toast({ title: "Payout Requested! 💸", description: `₦${amountNum.toLocaleString()} withdrawal submitted for review` });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: "Failed", description: error.message || "Could not submit payout request", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Request Payout
          </DialogTitle>
          <DialogDescription>
            Withdraw your earnings to your bank account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold text-primary">₦{availableBalance.toLocaleString()}</p>
          </div>

          {availableBalance < MIN_WITHDRAWAL && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Minimum withdrawal is ₦{MIN_WITHDRAWAL.toLocaleString()}. Keep selling to reach the threshold!
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Amount (₦)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min ₦${MIN_WITHDRAWAL.toLocaleString()}`}
              max={availableBalance}
              min={MIN_WITHDRAWAL}
            />
          </div>

          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input value={bankDetails.bank_name} onChange={(e) => setBankDetails(prev => ({ ...prev, bank_name: e.target.value }))} placeholder="e.g. GTBank" />
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input value={bankDetails.account_number} onChange={(e) => setBankDetails(prev => ({ ...prev, account_number: e.target.value }))} placeholder="0123456789" maxLength={10} />
          </div>
          <div className="space-y-2">
            <Label>Account Name</Label>
            <Input value={bankDetails.account_name} onChange={(e) => setBankDetails(prev => ({ ...prev, account_name: e.target.value }))} placeholder="John Doe" />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || availableBalance < MIN_WITHDRAWAL}
            className="w-full"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Banknote className="w-4 h-4 mr-2" />}
            Request ₦{Number(amount || 0).toLocaleString()} Payout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
