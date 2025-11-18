import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/fullcalendar.css";
import { siteConfig } from "@/config/site";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppSessionProvider } from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[--color-background] text-[--color-foreground] antialiased`}
      >
        <ThemeProvider>
          <AppSessionProvider>
            <QueryProvider>
              <SiteHeader />
              <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
                {children}
              </main>
              <SiteFooter />
            </QueryProvider>
          </AppSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
