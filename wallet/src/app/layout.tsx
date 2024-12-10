'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import NavbarWrapper from "@/components/NavbarWrapper";
import ClientLayout from "@/components/ClientLayout";
import { SessionProvider } from 'next-auth/react';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.className} bg-[#0D0E12]`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <Providers>
            <NavbarWrapper />
            <ClientLayout>
              <div className="min-h-screen">{children}</div>
            </ClientLayout>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}