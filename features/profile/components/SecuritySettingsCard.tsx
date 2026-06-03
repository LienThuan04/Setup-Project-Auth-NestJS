'use client';

import { useEffect, useState } from 'react';
import { authAPI } from '@/lib/axios/api';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LoaderIcon, KeyRoundIcon, SendIcon } from 'lucide-react';

type Step = 'request' | 'verify-otp' | 'set-password';

interface SecuritySettingsCardProps {
  email?: string;
}

export function SecuritySettingsCard({ email: initialEmail = '' }: SecuritySettingsCardProps) {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [tokenExpiresIn, setTokenExpiresIn] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const reset = () => {
    setStep('request');
    setOtp('');
    setTokenExpiresIn('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Bước 1: Gửi OTP
  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      await authAPI.changePasswordSendOtp({ email });
      toast.success('OTP sent to your email');
      setStep('verify-otp');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: Xác thực OTP → nhận reset token
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setIsLoading(true);
    try {
      const res = await authAPI.changePasswordVerifyOtp({ email, otp });
      const { expiresIn } = res.data.data;
      setTokenExpiresIn(expiresIn);
      setStep('set-password');
      toast.success(`OTP verified! You have ${expiresIn} to set your new password.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Invalid OTP');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 3: Đặt mật khẩu mới
  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await authAPI.changePasswordReset({ newPassword });
      toast.success('Password changed successfully!');
      reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to change password');
      // Nếu cookie reset token hết hạn → quay về bước 1
      if (err?.response?.status === 401 || err?.response?.data?.code === 'CONFLICT') {
        reset();
        toast.error('Reset session expired. Please start over.');
      }
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

        {/* Bước 1: Nhập email, gửi OTP */}
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
                <><LoaderIcon className="mr-2 h-4 w-4 animate-spin" />Sending...</>
              ) : (
                <><SendIcon className="mr-2 h-4 w-4" />Send OTP</>
              )}
            </Button>
          </>
        )}

        {/* Bước 2: Nhập OTP */}
        {step === 'verify-otp' && (
          <>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
            <div className="space-y-2">
              <Label htmlFor="security-otp">OTP Code</Label>
              <Input
                id="security-otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
              />
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset}>Back</Button>
              <Button onClick={handleVerifyOtp} disabled={isLoading || otp.length !== 6}>
                {isLoading ? (
                  <><LoaderIcon className="mr-2 h-4 w-4 animate-spin" />Verifying...</>
                ) : 'Verify OTP'}
              </Button>
            </div>
          </>
        )}

        {/* Bước 3: Đặt mật khẩu mới */}
        {step === 'set-password' && (
          <>
            {tokenExpiresIn && (
              <p className="text-sm text-muted-foreground">
                OTP verified. You have <strong>{tokenExpiresIn}</strong> to complete this step.
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="security-new-password">New Password</Label>
              <Input
                id="security-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="security-confirm-password">Confirm New Password</Label>
              <Input
                id="security-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
              />
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset}>Cancel</Button>
              <Button
                onClick={handleResetPassword}
                disabled={isLoading || !newPassword || !confirmPassword}
              >
                {isLoading ? (
                  <><LoaderIcon className="mr-2 h-4 w-4 animate-spin" />Changing...</>
                ) : 'Change Password'}
              </Button>
            </div>
          </>
        )}

      </CardContent>
    </Card>
  );
}
