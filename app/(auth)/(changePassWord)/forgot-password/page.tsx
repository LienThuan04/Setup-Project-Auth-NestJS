import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { Suspense } from 'react';

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4" >
            <Suspense fallback={<LoadingSkeleton variant="spinner" size="lg" />}>
                <ForgotPasswordForm className="w-full max-w-sm" />
            </Suspense>
        </div>
    );
}