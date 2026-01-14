import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import kycService from '@/services/kyc.service';
import { Loader2, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface KYCLevel1FormProps {
  onSuccess?: () => void;
}

export const KYCLevel1Form = ({ onSuccess }: KYCLevel1FormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [formData, setFormData] = useState({
    bvn: '',
    firstName: '',
    lastName: '',
  });

  // Check existing verification status on mount
  useEffect(() => {
    const checkKYCStatus = async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('bvn_verified')
          .eq('id', user.id)
          .single();
        
        if (data?.bvn_verified) {
          setIsVerified(true);
        }
      } catch (error) {
        console.error('Error checking KYC status:', error);
      }
    };
    checkKYCStatus();
  }, [user?.id]);

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
      // Check for specific BVN service unavailable error
      const errorMessage = error.message || '';
      if (errorMessage.includes('unavailable') || errorMessage.includes('451') || errorMessage.includes('not enabled')) {
        toast({
          title: 'BVN Service Unavailable',
          description: 'BVN verification is currently being activated. Please use Bank Account Verification instead.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Verification Failed',
          description: error.message || 'Something went wrong during verification.',
          variant: 'destructive',
        });
      }
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
    <div className="space-y-4">
      {/* BVN Unavailable Alert */}
      <Alert className="border-amber-500/30 bg-amber-500/5">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-700">BVN Verification Temporarily Unavailable</AlertTitle>
        <AlertDescription className="text-amber-600/80">
          BVN verification is currently being activated on our payment provider. 
          Please use <strong>Bank Account Verification</strong> (Level 2) instead — it provides the same benefits including the Verified Seller badge and payout access.
        </AlertDescription>
      </Alert>

      <Card className="border-primary/10 shadow-sm overflow-hidden opacity-60 pointer-events-none">
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
                disabled
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
                  disabled
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
                  disabled
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-2" disabled>
              Coming Soon
            </Button>
            <p className="text-[10px] text-muted-foreground text-center px-4">
              Your BVN is only used for identity verification and is processed securely. We do not store your BVN.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};