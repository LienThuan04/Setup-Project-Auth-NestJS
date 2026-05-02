import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "sonner";
import ReduxProvider from "@/redux/ReduxProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthInitializer from "@/components/auth/AuthInitializer";
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
        {/* 👇 Light mode background */}
        <div
          className="absolute inset-0 z-0 dark:hidden"
          style={{
            background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #6366f1 100%)",
          }}
        />
        {/* 👇 Dark mode background */}
        <div
          className="absolute inset-0 z-0 hidden dark:block"
          style={{
            background: "radial-gradient(125% 125% at 50% 100%, #000000 40%, #010133 100%)",
          }}
        />
        <div className="relative z-10 flex-1 flex flex-col">
          <ReduxProvider>
            <TooltipProvider>
              <ThemeInitializer>
                <AuthInitializer>
                  {children}
                </AuthInitializer>
              </ThemeInitializer>
              <Toaster richColors position="top-center" />
            </TooltipProvider>
          </ReduxProvider>
        </div>
      </body>
    </html>
  );
}