'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar/Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  const { status } = useSession();
  
  // Routes that should show navbar
  const navbarRoutes = [
    '/dashboard',
    '/wallet',
    '/stores',
    '/analysis',
    '/market',
    '/cards',
    '/transfer',
    '/settings'
  ];
  
  // Hide navbar on root, login, signup, home routes, or if not authenticated
  if (pathname === '/' || 
      pathname === '/login' || 
      pathname === '/signup' || 
      pathname === '/home' ||
      status !== 'authenticated') {
    return null;
  }
  
  // Show navbar only on specific authenticated routes
  if (!navbarRoutes.some(route => pathname.startsWith(route))) {
    return null;
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Navbar />
    </div>
  );
}
