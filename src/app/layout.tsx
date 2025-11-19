import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { Footer } from "@/components/Footer";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "NoteMarket | Kjøp og selg studiemateriale",
  description: "Norges beste markedsplass for studienotater og eksamensbesvarelser.",
  icons: {
    icon: [
      { url: "/logos/logo-nm-svg.drawio.svg", type: "image/svg+xml" },
      { url: "/logos/logo-nm-32-32.drawio.png", sizes: "32x32", type: "image/png" },
      { url: "/logos/logo-nm-16-16.drawio.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/logos/logo-nm-svg.drawio.svg",
    apple: "/logos/logo-nm-180-180.drawio.png",
    other: [
      { rel: "android-chrome", url: "/logos/logo-nm-192-192.drawio.png" },
      { rel: "android-chrome-large", url: "/logos/logo-nm-512-512.drawio.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" suppressHydrationWarning>
      <body className={`${outfit.variable} ${inter.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>
            {children}
            <Footer />
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
