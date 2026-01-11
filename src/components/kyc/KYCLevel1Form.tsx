import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import kycService from '@/services/kyc.service';
import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface KYCLevel1FormProps {
  onSuccess?: () => void;
}

export const KYCLevel1Form = ({ onSuccess }: KYCLevel1FormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState({
    bvn: '',
    firstName: '',
    lastName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.bvn.length !== 11) {
      toast({
        title: 'Invalid BVN',
        description: 'BVN must be exactly 11 digits',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await kycService.verifyLevel1(formData);
      if (result.status === 'VERIFIED') {
        setIsVerified(true);
        toast({
          title: 'Verification Successful',
          description: result.message || 'Your BVN has been verified.',
        });
        if (onSuccess) onSuccess();
      } else if (result.status === 'PENDING') {
        toast({
          title: 'Verification Pending',
          description: 'Your verification is being processed.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Something went wrong during verification.',
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
            <h3 className="text-lg font-semibold text-green-700">BVN Verified</h3>
            <p className="text-sm text-green-600/80">Your identity has been successfully confirmed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <CardTitle className="text-xl">Level 1 Verification</CardTitle>
        </div>
        <CardDescription>
          Verify your identity using your Bank Verification Number (BVN)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bvn">BVN (11 Digits)</Label>
            <Input
              id="bvn"
              placeholder="22222222222"
              value={formData.bvn}
              onChange={(e) => setFormData({ ...formData, bvn: e.target.value.replace(/\D/g, '').slice(0, 11) })}
              required
              className="font-mono tracking-widest text-lg"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify BVN'
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center px-4">
            Your BVN is only used for identity verification and is processed securely. We do not store your BVN.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
