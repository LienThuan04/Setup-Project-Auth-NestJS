'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ensureDeviceId } from "@/lib/cookie";
import { authAPI } from "@/lib/axios/api";
import { toast } from "sonner";
import { handleApiError } from "@/lib/handle-error";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const tokenKey = process.env.NEXT_PUBLIC_ACCESS_TOKEN_KEY;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // 1. Đảm bảo cookie deviceId tồn tại và gia hạn
    const deviceId = ensureDeviceId();
    console.log('Device ID for login:', deviceId);

    // 2. Thu thập thông tin đăng nhập từ form
    console.log('Device ID for login:', deviceId);
    const formData = new FormData(e.currentTarget);
    const data = {
      userNameOrEmail: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const res = await authAPI.login(data);
      const accessToken = res.data?.data?.accessToken;
      if (!accessToken) {
        toast.error('No access token returned from login' + JSON.stringify(res.data));
        return;
      }
      if (!tokenKey) {
        toast.error('Token key is not defined in environment variables');
        return;
      }
      localStorage.setItem(tokenKey, accessToken);
      toast.success(res.data?.message || 'Login successful!');
      router.push('/dashboard'); // Redirect to home page or dashboard after login

    } catch (error) {
      console.error('Login error:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email or username below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Username or Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="text"
            placeholder="John Doe or john.doe@example.com"
            required
            className="bg-background"
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="bg-background"
          />
        </Field>
        <Field>
          <Button type="submit">Login</Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button">
            <img
              src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/google/default.svg"
              alt="Google"
              width="16"
              height="16"
            />
            Login with Google
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
