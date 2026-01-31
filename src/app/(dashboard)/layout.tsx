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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Logo from '../../components/Logo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // State for Desktop Collapse
  const [userData, setUserData] = useState({
    name: 'User',
    balance: 0,
    verified: false,
    initial: 'U'
  });

  // 1. Fetch User Data
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
  }, [pathname]);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { name: 'Deposit', href: '/deposit', icon: Wallet },
    { name: 'Withdraw', href: '/withdrawal', icon: ArrowRightLeft },
    { name: 'Trade', href: '/trade', icon: LineChart },
    { name: 'Profile', href: '/settings/profile', icon: User },
    { name: 'Settings', href: '/settings/account', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-[#0b1221] text-white">
      
      {/* 1. MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 2. SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-[#1a1f2e] border-r border-white/10 
        transform transition-all duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 
        ${isCollapsed ? 'w-20' : 'w-64'} 
      `}>
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          
          {/* Logo - Hides text when collapsed */}
          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 overflow-hidden">
             {/* We use a simple div for the logo in collapsed mode to avoid layout breaks */}
             <div className="min-w-[32px]">
               <Logo className={isCollapsed ? "w-8 h-8" : "w-8 h-8"} />
             </div>
          </Link>

          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                title={isCollapsed ? item.name : ''} // Tooltip on hover when collapsed
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                  ${isCollapsed ? 'justify-center px-2' : ''}
                `}
              >
                <item.icon size={20} className="shrink-0" />
                
                {/* Text Label - Hidden when collapsed */}
                <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Collapse Toggle Button */}
        <div className="hidden md:flex justify-center p-2 border-t border-white/5">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 bg-[#0b1221] rounded-lg text-gray-400 hover:text-white border border-white/10 hover:border-white/30 transition-all"
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <button 
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium whitespace-nowrap
              ${isCollapsed ? 'justify-center px-2' : ''}
            `}
            title="Logout"
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      

      {/* 3. MAIN CONTENT WRAPPER */}
      {/* FIX: Always keep padding at 'pl-20' so content never squishes. */}
      <div className="flex flex-col min-h-screen md:pl-20 transition-all duration-300 ease-in-out">
        
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-[#0b1221] flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
          
          <div className="flex items-center gap-4">
            {/* Mobile Toggle */}
            <button 
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Desktop Toggle (Hamburger) */}
            <button 
              className="hidden md:block p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Right Side: Balance & Profile */}
          <div className="flex items-center gap-6">
            
            {/* Balance Widget */}
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