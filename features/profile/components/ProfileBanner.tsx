'use client';

import { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CameraIcon, ImageIcon, LoaderIcon } from 'lucide-react';
import { IMAGE_TYPES, IMAGE_UPLOAD, type ImageType } from '@/constants/upload';
import type { IUser } from '@/features/users/types';

interface ProfileBannerProps {
  user: IUser;
  isUploadingImg?: ImageType | null;
  onUpload?: (file: File, typeImg: ImageType) => void | Promise<boolean>;
  editable?: boolean;
}

/**
 * Profile summary card dùng chung cho self-profile và user detail.
 * Vẫn giữ primitive shadcn mặc định: Card / AspectRatio / Avatar / Badge / Button.
 */
export function ProfileBanner({
  user,
  isUploadingImg = null,
  onUpload,
  editable = false,
}: ProfileBannerProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const displayName = user.userName.replace(/_\d+$/, '');
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleFileChange = (typeImg: ImageType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) onUpload(file, typeImg);
    e.target.value = '';
  };

  const isUploadingAvatar = isUploadingImg === IMAGE_TYPES.AVATAR;
  const isUploadingBg = isUploadingImg === IMAGE_TYPES.BACKGROUND;

  return (
    <Card className="overflow-hidden p-0">
      <AspectRatio ratio={16 / 5} className="bg-muted">
        {user.backgroundUrl ? (
          <img src={user.backgroundUrl} alt="Background" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-muted to-muted/60 text-muted-foreground">
            <ImageIcon className="size-10 opacity-40" />
          </div>
        )}

        {editable && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isUploadingBg}
            onClick={() => bgInputRef.current?.click()}
            className="absolute right-3 top-3"
          >
            {isUploadingBg ? <LoaderIcon className="animate-spin" /> : <CameraIcon />}
            Change background
          </Button>
        )}
        <input
          ref={bgInputRef}
          type="file"
          accept={IMAGE_UPLOAD.ACCEPT}
          className="hidden"
          onChange={handleFileChange(IMAGE_TYPES.BACKGROUND)}
        />
      </AspectRatio>

      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Avatar className="size-20 border-2 border-background shadow-sm sm:size-24">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={displayName} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>

            {editable && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                disabled={isUploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 size-8 rounded-full shadow-sm"
              >
                {isUploadingAvatar ? <LoaderIcon className="animate-spin" /> : <CameraIcon />}
              </Button>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept={IMAGE_UPLOAD.ACCEPT}
              className="hidden"
              onChange={handleFileChange(IMAGE_TYPES.AVATAR)}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="space-y-2">
              <h2 className="break-words text-xl font-semibold leading-tight">{displayName}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{user.roleName}</Badge>
                <Badge variant="outline">{user.accountType}</Badge>
              </div>
            </div>

            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          {user.description?.trim() || 'No bio has been added yet.'}
        </p>
      </CardContent>
    </Card>
  );
}
