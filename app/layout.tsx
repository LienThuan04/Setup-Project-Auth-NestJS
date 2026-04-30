import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
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
      <body className="min-h-full flex flex-col">
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
      </body>
    </html>
  );
}
