'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoaderIcon, SaveIcon, ShieldCheckIcon } from 'lucide-react';
import { profileFormSchema, type ProfileFormData } from '@/features/profile/types';
import type { IUser } from '@/features/users/types';
import type { SaveInfoResult } from '@/features/profile/hooks/useProfile';

interface ProfileInfoFormProps {
  user: IUser;
  isSaving?: boolean;
  isVerifyingOtp?: boolean;
  otpTargetEmail?: string;
  otpChanges?: string[];
  onSave?: (data: ProfileFormData) => Promise<SaveInfoResult>;
  onVerifyOtp?: (otp: string) => Promise<boolean>;
  onCancelOtp?: () => void;
  editable?: boolean;
}

type FormErrors = Partial<Record<keyof ProfileFormData, string>>;

/**
 * Form chỉnh sửa info cá nhân — dùng toàn bộ shadcn primitive:
 *   Card / CardHeader / CardContent / CardFooter
 *   FieldSet / FieldGroup / Field / FieldLabel / FieldDescription / FieldError
 *   Input / Textarea / Button
 *
 * Validation đi qua Zod schema (profileFormSchema), lỗi hiển thị qua <FieldError errors=[...]>.
 * Pattern này giống với LoginForm / SignupForm (đều dùng Field, không react-hook-form).
 */
export function ProfileInfoForm({
  user,
  isSaving = false,
  isVerifyingOtp = false,
  otpTargetEmail = '',
  otpChanges = [],
  onSave,
  onVerifyOtp,
  onCancelOtp,
  editable = true,
}: ProfileInfoFormProps) {
  const initialForm = useMemo<ProfileFormData>(() => ({
    userName: user.userName.replace(/_\d+$/, ''),
    email: user.email,
    description: user.description ?? '',
  }), [user.userName, user.email, user.description]);

  const [form, setForm] = useState<ProfileFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Reset form khi user trong Redux thay đổi (vd sau upload avatar)
  useEffect(() => {
    setForm(initialForm);
    setErrors({});
  }, [initialForm]);

  // Reset OTP whenever dialog closes so stale input doesn't carry over to next open
  useEffect(() => {
    if (!isVerifyingOtp) setOtp('');
  }, [isVerifyingOtp]);

  const handleField = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!onSave) return;
    const result = profileFormSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ProfileFormData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    await onSave(result.data);
  };

  const handleVerifyOtp = async () => {
    if (!onVerifyOtp || otp.length !== 6) return;
    setVerifyingOtp(true);
    try {
      const success = await onVerifyOtp(otp);
      if (success) {
        setOtp('');
      }
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Tiện ích: bọc message string thành dạng <FieldError errors=[]> nhận
  const toErrors = (msg?: string) => (msg ? [{ message: msg }] : undefined);

  if (!editable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Read-only profile information for this account.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel>Username</FieldLabel>
                <Input readOnly value={form.userName} className="cursor-default" />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input readOnly value={form.email} className="cursor-default" />
              </Field>
              <Field>
                <FieldLabel>Bio</FieldLabel>
                <Textarea
                  readOnly
                  value={form.description || ''}
                  placeholder="No bio has been added yet."
                  rows={3}
                  className="cursor-default resize-none"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your username, email, and bio.</CardDescription>
          </CardHeader>

          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field data-invalid={!!errors.userName}>
                  <FieldLabel htmlFor="userName">Username</FieldLabel>
                  <Input
                    id="userName"
                    name="userName"
                    value={form.userName}
                    onChange={(e) => handleField('userName', e.target.value)}
                    placeholder="Your username"
                    aria-invalid={!!errors.userName}
                  />
                  <FieldDescription>Only letters, numbers, and underscore. 6-50 characters.</FieldDescription>
                  <FieldError errors={toErrors(errors.userName)} />
                </Field>

                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleField('email', e.target.value)}
                    placeholder="your@email.com"
                    aria-invalid={!!errors.email}
                  />
                  <FieldError errors={toErrors(errors.email)} />
                </Field>

                <Field data-invalid={!!errors.description}>
                  <FieldLabel htmlFor="description">Bio</FieldLabel>
                  <Textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={(e) => handleField('description', e.target.value)}
                    placeholder="Tell us a little about yourself"
                    rows={3}
                    aria-invalid={!!errors.description}
                  />
                  <FieldDescription>{form.description.length}/200 characters.</FieldDescription>
                  <FieldError errors={toErrors(errors.description)} />
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>

          <CardFooter className="justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <LoaderIcon className="animate-spin" /> : <SaveIcon />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* OTP Verification Dialog */}
      <Dialog open={isVerifyingOtp} onOpenChange={(open) => { if (!open && onCancelOtp) onCancelOtp(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-violet-500" />
              Verify Your Identity
            </DialogTitle>
            <DialogDescription>
              We sent a 6-digit OTP to{' '}
              <span className="font-semibold text-foreground">{otpTargetEmail}</span>
            </DialogDescription>
          </DialogHeader>

          {otpChanges.length > 0 && (
            <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertTitle>Changes to confirm</AlertTitle>
              <AlertDescription>
                <ul className="mt-1 list-disc list-inside space-y-0.5">
                  {otpChanges.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center gap-4 py-2">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={verifyingOtp}
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

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onCancelOtp} disabled={verifyingOtp}>
              Cancel
            </Button>
            <Button onClick={handleVerifyOtp} disabled={otp.length !== 6 || verifyingOtp}>
              {verifyingOtp ? (
                <>
                  <LoaderIcon className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Apply Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
