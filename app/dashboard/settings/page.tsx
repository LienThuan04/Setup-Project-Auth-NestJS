'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { ProfileBanner } from '@/features/profile/components/ProfileBanner';
import { ProfileInfoForm } from '@/features/profile/components/ProfileInfoForm';
import { ProfileAccountCard } from '@/features/profile/components/ProfileAccountCard';
import { SecuritySettingsCard } from '@/features/profile/components/SecuritySettingsCard';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { BadgeCheckIcon, InfoIcon, KeyRoundIcon } from 'lucide-react';

type SettingsTab = 'profile' | 'account' | 'security';

const VALID_TABS: SettingsTab[] = ['profile', 'account', 'security'];

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isSavingInfo, isVerifyingOtp, otpTargetEmail, otpChanges, isUploadingImg, saveInfo, verifyOtp, cancelOtp, uploadImage } = useProfile();

  const activeTab = useMemo<SettingsTab>(() => {
    const rawTab = searchParams.get('tab');
    return VALID_TABS.includes(rawTab as SettingsTab) ? (rawTab as SettingsTab) : 'profile';
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    const nextTab = VALID_TABS.includes(tab as SettingsTab) ? (tab as SettingsTab) : 'profile';
    router.replace(`${pathname}?tab=${nextTab}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, account details, and security settings in one place.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:w-fit">
          <TabsTrigger value="profile">
            <InfoIcon />
            Profile
          </TabsTrigger>
          <TabsTrigger value="account">
            <BadgeCheckIcon />
            Account
          </TabsTrigger>
          <TabsTrigger value="security">
            <KeyRoundIcon />
            Security
          </TabsTrigger>
        </TabsList>

        {!user ? (
          <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <LoadingSkeleton variant="card" text="Loading profile..." className="min-h-[260px]" />
            <LoadingSkeleton variant="card" text="Loading settings..." className="min-h-[320px]" />
          </div>
        ) : (
          <>
            <TabsContent value="profile">
              <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
                <ProfileBanner
                  user={user}
                  editable
                  isUploadingImg={isUploadingImg}
                  onUpload={uploadImage}
                />
                <ProfileInfoForm
                  user={user}
                  editable
                  isSaving={isSavingInfo}
                  isVerifyingOtp={isVerifyingOtp}
                  otpTargetEmail={otpTargetEmail}
                  otpChanges={otpChanges}
                  onSave={saveInfo}
                  onVerifyOtp={verifyOtp}
                  onCancelOtp={cancelOtp}
                />
              </div>
            </TabsContent>

            <TabsContent value="account">
              <div className="max-w-4xl">
                <ProfileAccountCard user={user} />
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="max-w-3xl">
                <SecuritySettingsCard email={user.email} />
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
