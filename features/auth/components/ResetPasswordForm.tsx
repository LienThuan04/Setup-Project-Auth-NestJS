'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/handle-error';
import { authAPI } from '@/lib/axios/api';
import Link from 'next/link';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const OTP_RESEND_COOLDOWN = parseInt(process.env.NEXT_PUBLIC_OTP_RESEND_COOLDOWN ?? '60', 10);

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);


  // 👇 Chặn nếu không có email
  useEffect(() => {
    if (!email) {
      toast.error('Invalid access. Please request a password reset first.');
      router.replace(ROUTES.FORGOT_PASSWORD);
    }
  }, [email, router]);

  // Đếm ngược
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePasswordVerifyOtp({
        email,
        otp,
        newPassword,
      });
      toast.success('Password changed successfully! Redirecting to login...');
      setTimeout(() => router.push(ROUTES.LOGIN), 1500);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // 👇 Gửi lại OTP
  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await authAPI.changePasswordSendOtp({ email });
      toast.success('OTP resent successfully!');
      setOtp('');
      setResendCountdown(OTP_RESEND_COOLDOWN);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setResending(false);
    }
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      {...props}
      method="POST"
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter the OTP sent to <strong>{email || 'your email'}</strong> and your new password
          </p>
        </div>

        {/* OTP */}
        <Field>
          <div className="flex flex-col items-center gap-2">
            <FieldLabel htmlFor="otp">OTP Code</FieldLabel>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              disabled={loading}
              containerClassName="justify-center"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <FieldDescription>6-digit code sent to your email</FieldDescription>
        </Field>

        {/* New Password */}
        <Field>
          <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
          <Input
            id="newPassword"
            type="password"
            placeholder="••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="bg-background"
            disabled={loading}
          />
          <FieldDescription>Must be at least 6 characters</FieldDescription>
        </Field>

        {/* Confirm Password */}
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="bg-background"
            disabled={loading}
          />
        </Field>

        {/* Submit */}
        <Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Changing Password...' : 'Reset Password'}
          </Button>
        </Field>

        {/* Resend OTP */}
        <FieldSeparator>Didn&apos;t receive the code?</FieldSeparator>
        <Field>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={resending || resendCountdown > 0}
          >
            {resending
              ? 'Resending...'
              : resendCountdown > 0
              ? `Resend OTP (${resendCountdown}s)`
              : 'Resend OTP'}
          </Button>
        </Field>

        {/* Back to Login */}
        <Field>
          <FieldDescription className="pt-2 text-center">
            Remember your password?{' '}
            <Link href={ROUTES.LOGIN} className="underline underline-offset-4">
              Back to Login
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}