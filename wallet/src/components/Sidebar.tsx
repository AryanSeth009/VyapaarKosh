'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  MagnifyingGlassIcon,
  Squares2X2Icon,
  WalletIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CreditCardIcon,
  ArrowsRightLeftIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Dashboard', icon: Squares2X2Icon, href: '/dashboard' },
  { name: 'My wallet', icon: WalletIcon, href: '/wallet' },
  { name: 'My stores', icon: ShoppingBagIcon, href: '/stores' },
  { name: 'Stocks', icon: ChartBarIcon, href: '/stocks' },
  { name: 'Cards', icon: CreditCardIcon, href: '/cards' },
  { name: 'Transfer', icon: ArrowsRightLeftIcon, href: '/transfer' },
  { name: 'Setting', icon: Cog6ToothIcon, href: '/settings' },
];

const sidebarItems = [
  { label: 'Dashboard', icon: Squares2X2Icon, href: '/dashboard' },
  { label: 'My wallet', icon: WalletIcon, href: '/wallet' },
  { label: 'My stores', icon: ShoppingBagIcon, href: '/stores' },
  { label: 'Stocks', icon: ChartBarIcon, href: '/stocks' },
  { label: 'Cards', icon: CreditCardIcon, href: '/cards' },
  { label: 'Transfer', icon: ArrowsRightLeftIcon, href: '/transfer' },
  { label: 'Setting', icon: Cog6ToothIcon, href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const user = null; // assuming user is not defined in this context
  const loading = false; // assuming loading is not defined in this context

  useEffect(() => {
    console.log('Sidebar Mounted:', {
      pathname,
      user: user ? 'User exists' : 'No user',
      loading
    });
  }, [pathname, user, loading]);

  return (
    <div className="h-full pt-12 p-6 border-top flex flex-col bg-[#0B0B10] text-white">
     
      {/* <div className="relative mb-8">
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-[#2A2A3C] rounded-2xl px-5 py-4 pl-12 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#F7931A] placeholder-gray-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <MagnifyingGlassIcon className="absolute left-4 top-4 h-5 w-5 text-gray-500" />
      </div> */}

      {/* Menu Items */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center p-3 rounded-lg transition-colors duration-300
                ${pathname === item.href 
                  ? 'bg-[#8A2BE2]/20 text-[#8A2BE2]' 
                  : 'text-gray-400 hover:bg-[#8A2BE2]/10 hover:text-[#8A2BE2]'}
              `}
            >
              <item.icon className="w-6 h-6 mr-3" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </ul>
      </nav>

      {/* Weather Widget */}
      <div className="mt-auto pt-6 border-t border-[#2A2A3C]">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-8 h-8 bg-[#2A2A3C] rounded-full flex items-center justify-center">
            <span className="text-xs">🌤️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white">28°C</span>
              <div className="flex items-center px-2 py-1 rounded-full bg-red-500/10">
                <span className="text-xs text-red-500">1</span>
              </div>
            </div>
            <span className="text-sm">Haze</span>
          </div>
        </div>
      </div>
    </div>
  );
}
