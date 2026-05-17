'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/axios/api';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LoaderIcon, KeyRoundIcon, SendIcon } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

type Step = 'request' | 'verify';

interface SecuritySettingsCardProps {
  email?: string;
}

export function SecuritySettingsCard({ email: initialEmail = '' }: SecuritySettingsCardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      await authAPI.changePasswordSendOtp({ email });
      toast.success('OTP sent to your email');
      setStep('verify');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await authAPI.changePasswordVerifyOtp({ email, otp, newPassword });
      toast.success('Password changed successfully. Please log in again.');
      router.replace(ROUTES.LOGIN);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRoundIcon className="h-4 w-4" />
          Security Settings
        </CardTitle>
        <CardDescription>
          Change your password using a one-time verification code sent to your email.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 'request' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="security-email">Email address</Label>
              <Input
                id="security-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <Button onClick={handleSendOtp} disabled={isLoading || !email}>
              {isLoading ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <SendIcon className="mr-2 h-4 w-4" />
                  Send OTP
                </>
              )}
            </Button>
          </>
        )}

        {step === 'verify' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="security-otp">OTP Code</Label>
              <Input
                id="security-otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code from your email"
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="security-new-password">New Password</Label>
              <Input
                id="security-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="security-confirm-password">Confirm New Password</Label>
              <Input
                id="security-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('request');
                  setOtp('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Back
              </Button>
              <Button onClick={handleVerifyOtp} disabled={isLoading || !otp || !newPassword || !confirmPassword}>
                {isLoading ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
