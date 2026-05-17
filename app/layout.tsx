import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "sonner";
import ReduxProvider from "@/redux/ReduxProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/features/auth/providers/AuthProvider";
import { ThemeInitializer } from "@/components/theme-initializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Graduation",
  description: "Graduation project with NestJS and Next.js",
};
// app/layout.tsx - Thêm dynamic rendering
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <div className="absolute inset-0 z-0 dark:hidden bg-gradient-light" />
        <div className="absolute inset-0 z-0 hidden dark:block bg-gradient-dark" />
        <div className="relative z-10 flex-1 flex flex-col">
          <ReduxProvider>
            <TooltipProvider>
              <ThemeInitializer>
                <AuthProvider>
                  {children}
                </AuthProvider>
              </ThemeInitializer>
              <Toaster richColors position="top-center" />
            </TooltipProvider>
          </ReduxProvider>
        </div>
      </body>
    </html>
  );
}