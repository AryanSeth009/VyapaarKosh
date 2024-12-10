'use client';

import { SessionProvider } from 'next-auth/react';
import { SidebarProvider } from '@/context/SidebarContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <SidebarProvider>
        {children}
        <Toaster />
      </SidebarProvider>
    </SessionProvider>
  );
}
