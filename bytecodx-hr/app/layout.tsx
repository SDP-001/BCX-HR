import type { Metadata } from "next";
import { Inter_Tight, Outfit, Urbanist } from "next/font/google";
import type { ReactNode } from "react";
import { ButtonEffects } from "@/components/ButtonEffects";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { CinematicScrollMotion } from "@/components/CinematicScrollMotion";
import { ScrollRevealMotion } from "@/components/ScrollRevealMotion";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ByteCodX | Enterprise HR Management Platform",
  description: "Premium enterprise HR platform for ByteCodX.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${urbanist.variable} ${interTight.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full bg-[#03010E] text-white antialiased">
        <ButtonEffects />
        <ScrollRevealMotion />
        <CinematicScrollMotion />
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}
