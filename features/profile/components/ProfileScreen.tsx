'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ProfileBanner } from '@/features/profile/components/ProfileBanner';
import { ProfileInfoForm } from '@/features/profile/components/ProfileInfoForm';
import { ProfileAccountCard } from '@/features/profile/components/ProfileAccountCard';
import type { ProfileFormData } from '@/features/profile/types';
import type { SaveInfoResult } from '@/features/profile/hooks/useProfile';
import type { IUser } from '@/features/users/types';
import type { ImageType } from '@/constants/upload';
import { ChevronLeftIcon, InfoIcon, ShieldIcon } from 'lucide-react';

type ProfileMode = 'self' | 'view';

interface ProfileScreenProps {
  user: IUser | null;
  mode: ProfileMode;
  title: string;
  description: string;
  isLoading?: boolean;
  isSavingInfo?: boolean;
  isVerifyingOtp?: boolean;
  otpTargetEmail?: string;
  otpChanges?: string[];
  isUploadingImg?: ImageType | null;
  onSaveInfo?: (data: ProfileFormData) => Promise<SaveInfoResult>;
  onVerifyOtp?: (otp: string) => Promise<boolean>;
  onCancelOtp?: () => void;
  onUploadImage?: (file: File, type: ImageType) => Promise<boolean> | void;
  backHref?: string;
  backLabel?: string;
}

export function ProfileScreen({
  user,
  mode,
  title,
  description,
  isLoading = false,
  isSavingInfo = false,
  isVerifyingOtp = false,
  otpTargetEmail = '',
  otpChanges = [],
  isUploadingImg = null,
  onSaveInfo,
  onVerifyOtp,
  onCancelOtp,
  onUploadImage,
  backHref,
  backLabel = 'Back',
}: ProfileScreenProps) {
  const editable = mode === 'self';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        {backHref && (
          <Button variant="outline" asChild>
            <Link href={backHref}>
              <ChevronLeftIcon />
              {backLabel}
            </Link>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <LoadingSkeleton variant="card" text="Loading profile..." className="min-h-[260px]" />
          <LoadingSkeleton variant="card" text="Loading profile details..." className="min-h-[320px]" />
        </div>
      ) : !user ? (
        <Card>
          <CardHeader>
            <CardTitle>Profile not found</CardTitle>
            <CardDescription>
              We could not load the requested profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The account may not exist anymore, or you may not have permission to view it.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div>
            <ProfileBanner
              user={user}
              editable={editable}
              isUploadingImg={isUploadingImg}
              onUpload={onUploadImage}
            />
          </div>

          <Tabs defaultValue="account" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:w-fit">
              <TabsTrigger value="account">
                <ShieldIcon />
                Account
              </TabsTrigger>
              <TabsTrigger value="info">
                <InfoIcon />
                Personal Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <ProfileInfoForm
                user={user}
                editable={editable}
                isSaving={isSavingInfo}
                isVerifyingOtp={isVerifyingOtp}
                otpTargetEmail={otpTargetEmail}
                otpChanges={otpChanges}
                onSave={onSaveInfo}
                onVerifyOtp={onVerifyOtp}
                onCancelOtp={onCancelOtp}
              />
            </TabsContent>

            <TabsContent value="account">
              <ProfileAccountCard user={user} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
