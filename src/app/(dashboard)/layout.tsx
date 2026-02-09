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
  ShieldCheck,
  Settings,
  Mail,
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import Logo from '../../components/Logo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: 'User',
    balance: 0,
    kycStatus: 'UNVERIFIED',
    initial: 'U'
  });
  const [unreadCount, setUnreadCount] = useState(0);

  const handleSessionExpired = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; Max-Age=0; path=/';
    window.location.href = '/auth/login';
  };

  const decodeToken = (token: string) => {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = JSON.parse(atob(normalized));
      return json;
    } catch {
      return null;
    }
  };

  // 1. Fetch User Data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeToken(token);
      if (payload?.exp) {
        const expiresAt = payload.exp * 1000;
        const remaining = expiresAt - Date.now();
        if (remaining <= 0) {
          handleSessionExpired();
        } else {
          const timeout = setTimeout(handleSessionExpired, remaining);
          return () => clearTimeout(timeout);
        }
      }
    }
    return undefined;
  }, []);

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const res = await originalFetch(...args);
      if (res.status === 401) {
        handleSessionExpired();
      }
      return res;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

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
              kycStatus: user.kycStatus || 'UNVERIFIED',
              initial: user.name ? user.name.charAt(0).toUpperCase() : 'U'
            });
          }
        }
      } catch (error) {
        console.error("Layout Load Error", error);
      }
    };

    fetchUserData();
  }, [pathname]);

  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout | null = null;

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('/api/user/messages/unread-count', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        if (mounted && typeof data?.count === 'number') {
          setUnreadCount(data.count);
        }
      } catch {
        // Ignore errors to avoid blocking UI.
      }
    };

    const handleRefresh = () => {
      fetchUnreadCount();
    };

    fetchUnreadCount();
    interval = setInterval(fetchUnreadCount, 30000);
    window.addEventListener('messages:unread-refresh', handleRefresh);

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
      window.removeEventListener('messages:unread-refresh', handleRefresh);
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { name: 'Messages', href: '/messages', icon: Mail },
    { name: 'Deposit', href: '/deposit', icon: Wallet },
    { name: 'Withdraw', href: '/withdrawal', icon: ArrowRightLeft },
    { name: 'Trade', href: '/trade', icon: LineChart },
    { name: 'Profile', href: '/settings/profile', icon: User },
    { name: 'KYC', href: '/settings/kyc', icon: ShieldCheck },
    { name: 'Settings', href: '/settings/account', icon: Settings },
  ];

  const kycLabel = (() => {
    switch (userData.kycStatus) {
      case 'VERIFIED':
        return { text: 'Verified', className: 'text-green-400' };
      case 'PENDING':
        return { text: 'Pending', className: 'text-yellow-400' };
      case 'REJECTED':
        return { text: 'Rejected', className: 'text-red-400' };
      default:
        return { text: 'Unverified', className: 'text-gray-400' };
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-[#0b1221] text-white flex">
      
      {/* 1. MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 2. SIDEBAR (Fixed Width 64 - Stable) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1f2e] border-r border-white/10 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Sidebar Header (Reduced Height h-24 -> h-16) */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
             <Logo />
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                `}
              >
                <item.icon size={20} className="shrink-0" />
                <span className="flex items-center gap-2">
                  {item.name}
                  {item.href === '/messages' && unreadCount > 0 && (
                    <span className="inline-flex items-center rounded-full bg-red-500 text-white text-[10px] font-bold px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button (Reduced Padding) */}
        <div className="p-3 border-t border-white/10 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
          >
            <LogOut size={20} className="shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 3. MAIN CONTENT (Pushed Right by 64) */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-300">
        
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-[#0b1221] flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
          
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Right Side: Balance & Profile */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 bg-[#1a1f2e] border border-white/10 px-4 py-1.5 rounded-xl">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                <Wallet size={16} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Available Balance</p>
                <p className="text-white font-mono font-bold text-sm">
                  ${userData.balance.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none mb-1">{userData.name}</p>
                <p className={`text-xs font-medium ${kycLabel.className}`}>
                  {kycLabel.text}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/20">
                {userData.initial}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}
