import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fraunces, Space_Grotesk } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atlanta Bites Tracker",
  description: "Track new restaurants, ratings, and meal photos in Atlanta.",
};

export const viewport: Viewport = {
  themeColor: "#fff7ee",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
