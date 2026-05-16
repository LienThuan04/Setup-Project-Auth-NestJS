import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<LoadingSkeleton variant="spinner" size="lg" />}>
        <ResetPasswordForm className="w-full max-w-sm" />
      </Suspense>
    </div>
  );
}