'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/handle-error';
import { authAPI } from '@/lib/axios/api';
import Link from 'next/link';

// Đọc env vars ở module-level, tránh đọc lại mỗi lần render
const OTP_EXPIRE = process.env.NEXT_PUBLIC_OTP_EXPIRE;
const OTP_RESEND_COOLDOWN = parseInt(process.env.NEXT_PUBLIC_OTP_RESEND_COOLDOWN ?? '60', 10);

export function VerifyOtpForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const router = useRouter();
  // Lấy email từ query param để biết đang xác thực cho email nào (nếu có)
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0); // giây

  // Đếm ngược mỗi giây
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1001); // 1001ms để đảm bảo không bị lệch do setInterval không chính xác
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleValueChange = (value: string) => {
    setOtp(value);
  };

  const handleComplete = async (value: string) => {
    const code = value;
    if (code.length !== 6) return;
    if (!email) {
      toast.error('Email is missing. Please sign up again.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.verifyRegisterOtp({ email, otp: code });
      toast.success('Verification successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 1000);
    } catch (error: any) {
      handleApiError(error);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await authAPI.resendRegisterOtp({ email });
      toast.success('OTP resent successfully!');
      setOtp('');
      setResendCountdown(OTP_RESEND_COOLDOWN); // bắt đầu đếm ngược theo giá trị từ env
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setResending(false);
    }
  };

  return (
    <form className={cn('flex flex-col gap-6', className)} {...props} onSubmit={(e) => e.preventDefault()} method="POST">
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Verify Account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter the OTP code sent to your email{' '}
            <span className="font-medium text-foreground">{email || 'your email'}</span>
          </p>
        </div>
        <Field>
          <div className="flex flex-col items-center gap-2">
            <FieldLabel htmlFor="otp">OTP Code</FieldLabel>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={handleValueChange}
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
          <FieldDescription>
            OTP code consists of 6 digits {OTP_EXPIRE && `(valid for ${OTP_EXPIRE})`}.
          </FieldDescription>
        </Field>
        <Field>
          <Button
            type="button"
            onClick={() => handleComplete(otp)}
            disabled={loading || otp.length !== 6}
            className="w-full"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </Field>
        <FieldSeparator>Didn't receive the code?</FieldSeparator>
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
          <FieldDescription className="px-6 text-center">
            Go back to{' '}
            <Link href="/signup" className="underline underline-offset-4">
              Sign Up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}