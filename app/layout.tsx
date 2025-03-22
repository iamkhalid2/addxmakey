import type { Metadata, Viewport } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProviders } from "@/components/providers";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const openSans = Open_Sans({
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "addXmakeY | AI Image Generation & Editing",
  description: "Create and edit stunning images using Gemini 2.0 AI technology",
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${openSans.variable}`}>
      <body
        className={`${openSans.className} antialiased bg-gradient-to-b from-white to-gray-50 dark:from-slate-950 dark:to-slate-900 min-h-screen`}
        suppressHydrationWarning
      >
        <ThemeProviders>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-20">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProviders>
      </body>
    </html>
  );
}
