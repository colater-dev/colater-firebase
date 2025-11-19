'use client';

import { useState } from 'react';
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import { AppHeader, AppSidebar } from "@/components/layout";
import { SidebarProvider } from "@/components/layout/sidebar-context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800&family=Roboto:wght@400;500;700;900&family=Open+Sans:wght@400;600;700;800&family=Lato:wght@400;700;900&family=Raleway:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700;800;900&family=Merriweather:wght@400;700;900&family=Nunito:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <FirebaseClientProvider>
          <SidebarProvider isOpen={isSidebarOpen}>
            <AppHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
            <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            {children}
            <Toaster />
          </SidebarProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
