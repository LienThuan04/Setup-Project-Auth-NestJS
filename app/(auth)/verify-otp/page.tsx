import { LoadingSpinner } from "@/components/loading-spinner";
import { VerifyOtpForm } from "@/components/verify-otp-form";
import { Suspense } from "react";

export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<LoadingSpinner size="lg" text="Loading..." />}>
        <VerifyOtpForm className="w-full max-w-md" />
      </Suspense>
    </div>
  );
}