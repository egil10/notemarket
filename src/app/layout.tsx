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
