import AuthRoute from '@/features/auth/providers/AuthRoute';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthRoute>{children}</AuthRoute>;
}
