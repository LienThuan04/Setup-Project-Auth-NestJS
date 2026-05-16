'use client';

import ProtectedRoute from '@/features/auth/providers/ProtectedRoute';
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

// Map path to display name
const breadcrumbNames: Record<string, string> = {
  'users': 'Users Management',
  'settings': 'Settings',
  'profile': 'Profile',
  'admin': 'Admin Panel',
};

function getBreadcrumbName(pathname: string): string {
  if (pathname === ROUTES.DASHBOARD.ROOT) return 'Overview';
  
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  // Nếu là UUID (user detail) → hiển thị "User Detail"
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment)) {
    return 'User Detail';
  }
  
  // Lấy tên từ map hoặc capitalize
  return breadcrumbNames[lastSegment] || 
    lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href={ROUTES.DASHBOARD.ROOT}>Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  {pathname !== '/dashboard' && (
                    <>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{getBreadcrumbName(pathname)}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}