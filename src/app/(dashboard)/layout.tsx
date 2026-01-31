'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  Wallet, 
  ArrowRightLeft, 
  LineChart, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: 'User',
    balance: 0,
    verified: false,
    initial: 'U'
  });

  // 1. Fetch User Data for the Top Bar
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('/api/user/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
        });

        if (res.ok) {
          const data = await res.json();
          const user = data.user;
          if (user) {
            setUserData({
              name: user.name || 'User',
              balance: Number(user.portfolioBalance) || 0,
              verified: user.verified || false,
              initial: user.name ? user.name.charAt(0).toUpperCase() : 'U'
            });
          }
        }
      } catch (error) {
        console.error("Layout Load Error", error);
      }
    };

    fetchUserData();
  }, [pathname]); // Re-fetch when page changes to keep balance updated

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { name: 'Deposit', href: '/deposit', icon: Wallet },
    { name: 'Withdraw', href: '/withdrawal', icon: ArrowRightLeft },
    { name: 'Trade', href: '/trade', icon: LineChart },
    { name: 'Profile', href: '/settings/profile', icon: User },
    { name: 'Settings', href: '/settings/account', icon: Settings },
  ];

  // Helper to get current date formatted like "Saturday, January 31"
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-[#0b1221] text-white flex">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-20 md:w-24 bg-[#1a1f2e] border-r border-white/5 flex flex-col items-center py-8
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Logo Icon */}
        <div className="mb-10 p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/50">
          <LayoutGrid size={24} className="text-white" />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 flex flex-col gap-6 w-full px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all group
                  ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:bg-white/5 hover:text-white'}
                `}
              >
                <item.icon size={20} />
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/auth/login';
          }}
          className="mt-auto p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut size={20} />
        </button>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col md:pl-24 h-screen overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-20 border-b border-white/5 bg-[#0b1221] flex items-center justify-between px-6 shrink-0">
          
          {/* Mobile Menu Toggle & Date */}
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
            <div className="hidden md:block text-gray-400 text-sm font-medium">
              {today}
            </div>
          </div>

          {/* Right Side: Balance Widget & Profile */}
          <div className="flex items-center gap-6">
            
            {/* 💰 AVAILABLE BALANCE WIDGET */}
            <div className="hidden md:flex items-center gap-4 bg-[#1a1f2e] border border-white/10 px-4 py-2 rounded-xl">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Available Balance</p>
                <p className="text-white font-mono font-bold">
                  ${userData.balance.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-3 pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none mb-1">{userData.name}</p>
                <p className={`text-xs font-medium ${userData.verified ? 'text-green-400' : 'text-yellow-400'}`}>
                  {userData.verified ? 'Verified Account' : 'Unverified'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
                {userData.initial}
                {userData.verified && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0b1221] rounded-full translate-x-1 translate-y-1"></div>
                )}
              </div>
            </div>

          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}