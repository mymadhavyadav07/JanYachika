"use client"

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "next-themes";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { usePathname } from "next/navigation";
import Particles from "@/components/blocks/Backgrounds/Particles/Particles";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import ClickSpark from "@/components/ClickSpark";
import TransitionWrapper from "@/components/TransitionWrapper";
import 'leaflet/dist/leaflet.css';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const loginPortal = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname.startsWith("/admin") || pathname.startsWith("/officer");
  // const [isMounted, setIsMounted] = useState(false);
  
  //   useEffect(() => {
  //       setIsMounted(true);
  //   }, []);
  
  
  return (
    <html lang="en" suppressHydrationWarning>
      
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        {!loginPortal && <Header className="mt-2" />}
        
        <ThemeProvider attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange >
          <TransitionWrapper>
          <ClickSpark
            sparkColor='#fff'
            sparkSize={10}
            sparkRadius={15}
            sparkCount={8}
            duration={400}
          >
          <div className="fixed inset-0 -z-10 w-full min-h-screen">
             <Particles
    particleColors={['#dc2626', '#f97316']}
    particleCount={200}
    particleSpread={10}
    speed={0.1}
    particleBaseSize={100}
    moveParticlesOnHover={true}
    alphaParticles={false}
    disableRotation={false}
  />
          </div>

          
          <div style={{ position: 'relative', minHeight: '100vh' }}>
            <main className="min-h-screen">{children}</main>
            <Toaster />
          </div>
          
          
        
        {!loginPortal && <Footer className=""/>}
        </ClickSpark>
        </TransitionWrapper>
        </ThemeProvider>
        
      </body>
    </html>
  );
}
