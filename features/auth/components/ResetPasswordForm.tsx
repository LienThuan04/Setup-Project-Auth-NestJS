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

type Step = 'verify-otp' | 'set-password';

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [step, setStep] = useState<Step>('verify-otp');
  const [otp, setOtp] = useState('');
  const [resetPassToken, setResetPassToken] = useState('');
  const [tokenExpiresIn, setTokenExpiresIn] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Chặn nếu không có email
  useEffect(() => {
    if (!email) {
      toast.error('Invalid access. Please request a password reset first.');
      router.replace(ROUTES.FORGOT_PASSWORD);
    }
  }, [email, router]);

  // Đếm ngược resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // ── Bước 1: Xác thực OTP ──────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const res = await authAPI.changePasswordVerifyOtp({ email, otp });
      const { resetPassToken: token, expiresIn } = res.data.data;
      setResetPassToken(token);
      setTokenExpiresIn(expiresIn);
      setStep('set-password');
      toast.success(`OTP verified! You have ${expiresIn} to set your new password.`);
    } catch (error: any) {
      handleApiError(error);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  // ── Bước 2: Đặt mật khẩu mới ─────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await authAPI.changePasswordReset({ resetPassToken, newPassword });
      toast.success('Password changed successfully! Redirecting to login...');
      setTimeout(() => router.push(ROUTES.LOGIN), 1500);
    } catch (error: any) {
      handleApiError(error);
      // Nếu token hết hạn → quay về bước 1
      if ((error as any)?.response?.data?.code === 'CONFLICT') {
        setStep('verify-otp');
        setResetPassToken('');
        setOtp('');
        toast.error('Reset session expired. Please verify OTP again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP (chỉ ở bước 1) ─────────────────────────────────────────────
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

  // ── Render bước 1: nhập OTP ───────────────────────────────────────────────
  if (step === 'verify-otp') {
    return (
      <form
        className={cn('flex flex-col gap-6', className)}
        onSubmit={(e) => e.preventDefault()}
        {...props}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Step 1 of 2 — Enter the OTP sent to{' '}
              <strong>{email || 'your email'}</strong>
            </p>
          </div>

          <Field>
            <div className="flex flex-col items-center gap-2">
              <FieldLabel>OTP Code</FieldLabel>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={loading}
                containerClassName="justify-center"
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <FieldDescription>6-digit code sent to your email</FieldDescription>
          </Field>

          <Field>
            <Button
              type="button"
              className="w-full"
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </Field>

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

          <Field>
            <FieldDescription className="text-center">
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

  // ── Render bước 2: nhập mật khẩu mới ─────────────────────────────────────
  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleResetPassword}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Set New Password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Step 2 of 2 — OTP verified{tokenExpiresIn && `. You have ${tokenExpiresIn} to complete this step.`}
          </p>
        </div>

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

        <Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Changing Password...' : 'Reset Password'}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center">
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
