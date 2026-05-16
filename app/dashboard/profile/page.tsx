'use client';

import { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { patchUser } from '@/redux/features/auth/authSlice';
import { usersAPI } from '@/lib/axios/api';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CameraIcon, SaveIcon, LoaderIcon } from 'lucide-react';
import { handleApiError } from '@/lib/handle-error';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [userName, setUserName] = useState(user?.userName.replace(/_\d+$/, '') ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [description, setDescription] = useState(user?.description ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const displayName = user.userName.replace(/_\d+$/, '');
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleSaveInfo = async () => {
    setIsSaving(true);
    try {
      await usersAPI.update(user.id, { userName, email, description });
      dispatch(patchUser({ userName, email, description }));
      toast.success('Profile updated successfully');
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('imgProfile', file);
    formData.append('typeImg', 'AVATAR');

    setIsUploading(true);
    try {
      const response = await usersAPI.uploadAvatarOrBg(user.id, formData);
      const avatarUrl: string | null = response.data?.data?.avatarUrl ?? null;
      dispatch(patchUser({ avatarUrl }));
      toast.success('Avatar updated successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      {/* Avatar card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Picture</CardTitle>
          <CardDescription>Click on your avatar to upload a new photo</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={displayName} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
            >
              {isUploading
                ? <LoaderIcon className="h-5 w-5 text-white animate-spin" />
                : <CameraIcon className="h-5 w-5 text-white" />
              }
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-medium">{displayName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="mt-1">{user.roleName}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
          <CardDescription>Update your username, email, and bio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userName">Username</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Bio</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us a little about yourself"
            />
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSaveInfo} disabled={isSaving}>
              {isSaving
                ? <><LoaderIcon className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                : <><SaveIcon className="mr-2 h-4 w-4" /> Save Changes</>
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Read-only info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account ID</span>
            <span className="font-mono text-xs">{user.id}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account type</span>
            <Badge variant="outline">{user.accountType}</Badge>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <Badge>{user.roleName}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
