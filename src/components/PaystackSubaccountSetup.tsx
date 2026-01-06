import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Building2, CheckCircle, AlertCircle, CreditCard, Banknote } from "lucide-react";

interface Bank {
  name: string;
  code: string;
}

interface PaystackSubaccountSetupProps {
  shopId: string;
  shopName: string;
  existingSubaccountCode?: string | null;
  existingBankCode?: string | null;
  existingAccountNumber?: string | null;
  onSuccess?: () => void;
}

export const PaystackSubaccountSetup = ({
  shopId,
  shopName,
  existingSubaccountCode,
  existingBankCode,
  existingAccountNumber,
  onSuccess,
}: PaystackSubaccountSetupProps) => {
  const { toast } = useToast();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankCode, setBankCode] = useState(existingBankCode || "");
  const [accountNumber, setAccountNumber] = useState(existingAccountNumber || "");
  const [isConnected, setIsConnected] = useState(!!existingSubaccountCode);

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('paystack-list-banks');
      
      if (error) throw error;
      
      if (data?.success && data.data) {
        setBanks(data.data);
      }
    } catch (error) {
      console.error('Failed to load banks:', error);
      toast({
        title: "Error",
        description: "Failed to load bank list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankCode || !accountNumber) {
      toast({
        title: "Missing Information",
        description: "Please select a bank and enter your account number.",
        variant: "destructive",
      });
      return;
    }

    if (accountNumber.length !== 10) {
      toast({
        title: "Invalid Account Number",
        description: "Account number must be 10 digits.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Please log in to continue');
      }

      const { data, error } = await supabase.functions.invoke('paystack-create-subaccount', {
        body: {
          shop_id: shopId,
          business_name: shopName,
          bank_code: bankCode,
          account_number: accountNumber,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setIsConnected(true);
        toast({
          title: "Payment Account Connected! 🎉",
          description: `Account verified: ${data.data.account_name}. You'll receive payments directly.`,
        });
        onSuccess?.();
      } else {
        throw new Error(data?.error || 'Failed to create payment account');
      }
    } catch (error: any) {
      console.error('Subaccount creation error:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "Could not set up payment account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isConnected) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            Direct Payments Enabled
          </CardTitle>
          <CardDescription>
            Customer payments will be split automatically - you receive your share directly!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
            <Building2 className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium">Bank Account Connected</p>
              <p className="text-sm text-muted-foreground">
                {banks.find(b => b.code === (existingBankCode || bankCode))?.name || 'Bank'} • 
                ****{(existingAccountNumber || accountNumber).slice(-4)}
              </p>
            </div>
            <Badge variant="outline" className="ml-auto bg-green-500/10 text-green-600 border-green-500/20">
              Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            <Banknote className="w-3 h-3 inline mr-1" />
            Payments are deposited directly to your bank account
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Enable Direct Payments
        </CardTitle>
        <CardDescription>
          Connect your bank account to receive customer payments directly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank">Select Your Bank</Label>
            <Select value={bankCode} onValueChange={setBankCode} disabled={isLoadingBanks}>
              <SelectTrigger id="bank">
                <SelectValue placeholder={isLoadingBanks ? "Loading banks..." : "Choose your bank"} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {banks.map((bank) => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              placeholder="Enter your 10-digit account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
            />
            {accountNumber && accountNumber.length !== 10 && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Account number must be 10 digits
              </p>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
            <p className="font-medium">How it works:</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• We'll verify your account details with Paystack</li>
              <li>• Customer payments go directly to your bank</li>
              <li>• You receive 100% of every transaction</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled={isSubmitting || isLoadingBanks || !bankCode || accountNumber.length !== 10}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying & Connecting...
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 mr-2" />
                Connect Bank Account
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
