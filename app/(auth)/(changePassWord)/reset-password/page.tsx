import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
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