import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProviders } from "@/components/providers";

const openSans = Open_Sans({
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "addXmakeY",
  description: "Edit and generate images using Gemini 2.0",
  icons: {
    icon: '/ADAX.png',
    apple: '/ADAX.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${openSans.className} antialiased bg-white dark:bg-slate-950`}
        suppressHydrationWarning
      >
        <ThemeProviders>{children}</ThemeProviders>
      </body>
    </html>
  );
}
