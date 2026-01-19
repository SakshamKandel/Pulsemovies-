import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SITE_CONFIG } from "@/lib/constants";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0D0D0D",
};

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: ["movies", "streaming", "TV shows", "watch online", "entertainment"],
  authors: [{ name: SITE_CONFIG.name }],
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
  },
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-text-primary antialiased" suppressHydrationWarning>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
