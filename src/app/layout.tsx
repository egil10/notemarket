import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "NoteMarket | Kjøp og selg studiemateriale",
  description: "Norges beste markedsplass for studienotater og eksamensbesvarelser.",
  icons: {
    icon: "/logos/logo-32-32.drawio.png",
    shortcut: "/logos/logo-32-32.drawio.png",
    apple: "/logos/logo-180-180.drawio.png",
    other: [
      { rel: "android-chrome", url: "/logos/logo-192-192.drawio.png" },
      { rel: "android-chrome-large", url: "/logos/logo-512-512.drawio.png" },
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
        <ToastProvider>
          {children}
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
