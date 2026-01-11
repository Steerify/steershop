import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import kycService from '@/services/kyc.service';
import { Loader2, CheckCircle2, Landmark } from 'lucide-react';

interface KYCLevel2FormProps {
  onSuccess?: (accountName: string) => void;
}

// Nigerian Banks are now fetched from the Paystack API via kycService


export const KYCLevel2Form = ({ onSuccess }: KYCLevel2FormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [banksLoading, setBanksLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [banks, setBanks] = useState<{code: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    accountNumber: '',
    bankCode: '',
  });

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const banksList = await kycService.getBanks();
        if (banksList && banksList.length > 0) {
          setBanks(banksList);
        } else {
          // Fallback if API fails
          setBanks([
            { code: '058', name: 'GTBank' },
            { code: '011', name: 'First Bank' },
            { code: '044', name: 'Access Bank' },
            { code: '033', name: 'UBA' },
            { code: '057', name: 'Zenith Bank' },
            { code: '901', name: 'Kuda Bank' },
            { code: '100004', name: 'Opay (Paycom)' },
            { code: '999992', name: 'PalmPay' },
          ]);
        }
      } catch (error) {
        console.error('Error in component fetching banks:', error);
      } finally {
        setBanksLoading(false);
      }
    };
    fetchBanks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.accountNumber.length !== 10) {
      toast({
        title: 'Invalid Account Number',
        description: 'Account number must be exactly 10 digits',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.bankCode) {
      toast({
        title: 'Bank Required',
        description: 'Please select your bank',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await kycService.verifyLevel2(formData);
      if (result.status === 'VERIFIED') {
        setIsVerified(true);
        setVerifiedName(result.account_name);
        toast({
          title: 'Bank Verification Successful',
          description: `Account verified: ${result.account_name}`,
        });
        if (onSuccess) onSuccess(result.account_name);
      }
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'The bank account name does not match your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-700">Bank Account Verified</h3>
            <p className="font-medium text-green-800 uppercase mt-1">{verifiedName}</p>
            <p className="text-sm text-green-600/80 mt-2 text-balance">
              Your bank account has been successfully linked to your profile identity.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-accent to-purple-500" />
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <Landmark className="w-5 h-5 text-accent" />
          <CardTitle className="text-xl">Level 2 Verification</CardTitle>
        </div>
        <CardDescription>
          Verify your identity by matching your profile with a bank account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank">Select Bank</Label>
            <Select 
              onValueChange={(value) => setFormData({ ...formData, bankCode: value })}
              value={formData.bankCode}
            >
              <SelectTrigger id="bank" disabled={banksLoading}>
                <SelectValue placeholder={banksLoading ? "Loading banks..." : "Choose your bank"} />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number (10 Digits)</Label>
            <Input
              id="accountNumber"
              placeholder="0123456789"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              required
              className="font-mono tracking-widest text-lg"
            />
          </div>
          <Button type="submit" className="w-full mt-2 bg-gradient-to-r from-accent to-purple-500 hover:opacity-90 border-none" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Bank Account'
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center px-4">
            We use this to ensure the bank account belongs to you. This is required for payouts.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
