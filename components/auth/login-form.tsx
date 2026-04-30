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
import { toast } from "sonner";
import { handleApiError } from "@/lib/handle-error";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginUser } from "@/redux/features/auth/authSlice";
import { authAPI } from "@/lib/axios/api";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.auth);

  const handleGoogleLogin = async () => {
    ensureDeviceId();
    authAPI.googleLogin();
      // Sau khi gọi API, backend sẽ trả về URL để redirect, hoặc frontend có thể tự xây dựng URL dựa trên config
      // Ở đây giả sử backend đã xử lý redirect nên không cần làm gì thêm
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      userNameOrEmail: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const res = await dispatch(loginUser(data)); // unwrap để lấy payload hoặc lỗi từ thunk
      if (loginUser.fulfilled.match(res)) {
        router.push('/dashboard'); // Redirect to home page or dashboard after login
      } else {
        toast.error(res.payload as string || 'Login failed');
      }
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
          <Button variant="outline" type="button" disabled={loading} onClick={handleGoogleLogin}>
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
