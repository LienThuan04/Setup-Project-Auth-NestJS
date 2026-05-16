"use client"

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
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { authAPI } from "@/lib/axios/api"
import { handleApiError } from "@/lib/handle-error"
import { ensureDeviceId } from "@/lib/cookie"
import { ROUTES } from "@/lib/routes"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
      ensureDeviceId();
      authAPI.googleLogin();
        // Sau khi gọi API, backend sẽ trả về URL để redirect, hoặc frontend có thể tự xây dựng URL dựa trên config
        // Ở đây giả sử backend đã xử lý redirect nên không cần làm gì thêm
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirm-password") as string,
      userName: formData.get("name") as string
    }
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match")
      setLoading(false)
      return
    }
    if (data.password.length < 6) {
      toast.warning("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    // Call API to register user and send OTP
    try {
      const res = await authAPI.register({
        email: data.email,
        password: data.password,
        userName: data.userName
      })
      toast.success("Account created successfully!")
      router.push(`${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }

  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit} method="POST">
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">User Name</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            className="bg-background"
            disabled={loading}
          />
          <FieldDescription>
            This username will be used for login. Must be unique across all users.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            className="bg-background"
            disabled={loading}
          />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="bg-background"
            disabled={loading}
          />
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            required
            className="bg-background"
            disabled={loading}
          />
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
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
            Sign up with Google
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link href={ROUTES.LOGIN} className="underline underline-offset-4">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
