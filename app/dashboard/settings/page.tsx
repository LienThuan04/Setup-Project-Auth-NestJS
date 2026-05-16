'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/axios/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LoaderIcon, KeyRoundIcon, SendIcon } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { ROUTES } from '@/lib/routes';

type Step = 'request' | 'verify';

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState(user?.email ?? '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRoundIcon className="h-4 w-4" />
            Change Password
          </CardTitle>
          <CardDescription>
            We will send a one-time code to your email to confirm the change.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'request' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleSendOtp} disabled={isLoading || !email}>
                {isLoading
                  ? <><LoaderIcon className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                  : <><SendIcon className="mr-2 h-4 w-4" /> Send OTP</>
                }
              </Button>
            </>
          )}

          {step === 'verify' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code from your email"
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setStep('request'); setOtp(''); }}>
                  Back
                </Button>
                <Button onClick={handleVerifyOtp} disabled={isLoading || !otp || !newPassword}>
                  {isLoading
                    ? <><LoaderIcon className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                    : 'Change Password'
                  }
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
