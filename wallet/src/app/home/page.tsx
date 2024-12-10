'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
    else if (status === 'unauthenticated') {
      console.log('User is not authenticated');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen select-none  bg-[#0A0B0F] text-white overflow-hidden">
      {/* Navbar */}
      <nav className="relative z-20 w-full py-6 px-8">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-purple-500 text-3xl">⚡</div>
            <span className="text-xl font-semibold">CryptoWallet</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-gray-300 hover:text-white transition-colors">
              About
            </Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#integrations" className="text-gray-300 hover:text-white transition-colors">
              Integrations
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="px-6 py-2 bg-white text-[#8A2BE2] rounded-full hover:bg-white/5 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="px-6 py-2 bg-[#8A2BE2] text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              Try Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Background Gradient Lines */}
      <div className="fixed inset-0 z-0 select-none pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full">
          {/* Purple gradient lines */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[linear-gradient(45deg,transparent_45%,rgba(123,97,255,0.1)_45%,rgba(123,97,255,0.1)_55%,transparent_55%)]" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[linear-gradient(45deg,transparent_35%,rgba(123,97,255,0.1)_35%,rgba(123,97,255,0.1)_45%,transparent_45%)]" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[linear-gradient(45deg,transparent_25%,rgba(123,97,255,0.1)_25%,rgba(123,97,255,0.1)_35%,transparent_35%)]" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pt-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div>
            <h1 className="text-[5.1rem]  w-[400px] font-regular leading-none mb-6">
              Crypto for Everyone
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Safe and easy crypto trading for everyone.
              <br />
              Invest in cryptocurrency with Fyra
            </p>
            <button className="px-8 py-4 bg-white text-black rounded-full text-lg font-medium hover:bg-gray-100 transition-colors">
              Get Started
            </button>
          </div>

          {/* Right Column - Cards Grid */}
          <div className="grid grid-cols-12 gap-4 auto-rows-min">
            {/* Portfolio Balance Card - Spans 8 columns */}
            <div className="col-span-8 bg-[#12131A] rounded-3xl p-6 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400">Portfolio Balance</span>
                <div className="flex bg-[#1E1F2E] rounded-full p-0.5">
                  <span className="px-4 py-1 bg-white text-black rounded-full text-xs font-medium">USD</span>
                  <span className="px-4 py-1 text-gray-400 text-xs">BTC</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold">$32,147</span>
                <span className="text-green-400 text-sm">+3.12</span>
              </div>
              {/* Purple Gradient Chart */}
              <div className="h-24 w-full bg-gradient-to-b from-purple-500/10 rounded-lg relative">
                <div className="absolute inset-0">
                  <svg className="w-full h-full" preserveAspectRatio="none">
                    <path
                      d="M0 50 Q 100 20, 200 40 T 400 30"
                      stroke="rgb(139, 92, 246)"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Crypto Cards Container - Spans 4 columns */}
            <div className="col-span-4 space-y-4">
              {/* ETH Card */}
              <div className="bg-[#12131A] rounded-3xl p-6 border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-2xl font-bold">ETH</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs text-gray-500">AMOUNT</span>
                  <div className="text-xl font-medium">34.25323</div>
                </div>
              </div>

              {/* SOL Card */}
              <div className="bg-[#12131A] rounded-3xl p-6 border border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-2xl font-bold">SOL</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs text-gray-500">AMOUNT</span>
                  <div className="text-xl font-medium">265.2896</div>
                </div>
              </div>
            </div>

            {/* Bitcoin Price Card - Spans full width */}
            <div className="col-span-12 bg-[#12131A] rounded-3xl p-6 border border-white/5">
              <div className="text-xs text-gray-500 mb-2">BITCOIN PRICE</div>
              <div className="text-xl font-bold mb-6">US$ 57,450</div>
              <div className="grid grid-cols-7 gap-4 text-xs text-gray-500 mb-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
              <div className="relative h-16">
                <svg className="w-full h-full" preserveAspectRatio="none">
                  <path
                    d="M0 30 L46 25 L92 35 L138 28 L184 32 L230 20 L276 30"
                    stroke="rgb(139, 92, 246)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle cx="230" cy="20" r="3" fill="rgb(139, 92, 246)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
