'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Wallet } from 'lucide-react';

export default function Topbar() {
  const [balance, setBalance] = useState(0);
  const [username, setUsername] = useState('Loading...');
  const [initial, setInitial] = useState('');
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState('UNVERIFIED');
  
  // FIX: Start with empty string to prevent Server/Client mismatch
  const [formattedDate, setFormattedDate] = useState(''); 

  useEffect(() => {
    // 1. Set the date only on the client side
    setFormattedDate(new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    }));

    // 2. Fetch User Data
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('/api/user/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
        });
        
        const data = await res.json();

        if (data.user?.name) {
          setUsername(data.user.name);
          setInitial(data.user.name.charAt(0).toUpperCase());
        } else {
          setUsername('User');
          setInitial('U');
        }
        if (data.user?.kycStatus) {
          setKycStatus(data.user.kycStatus);
        } else {
          setKycStatus('UNVERIFIED');
        }

        if (data.balances?.available !== undefined) {
          setBalance(data.balances.available);
        }
      } catch (err) {
        console.error("Topbar error:", err);
        setUsername('User');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const kycLabel = (() => {
    switch (kycStatus) {
      case 'VERIFIED':
        return { text: 'Verified', className: 'text-green-400', dot: 'bg-green-500' };
      case 'PENDING':
        return { text: 'Pending', className: 'text-yellow-400', dot: 'bg-yellow-500' };
      case 'REJECTED':
        return { text: 'Rejected', className: 'text-red-400', dot: 'bg-red-500' };
      default:
        return { text: 'Unverified', className: 'text-gray-400', dot: 'bg-gray-500' };
    }
  })();

  return (
    <header className="h-20 bg-[#0b1220]/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 md:px-8 sticky top-0 z-30">
      
      {/* Left: Date Display */}
      <div className="hidden md:block">
        <h2 className="text-gray-400 text-sm font-medium">
          {/* Render the state variable, not new Date() directly */}
          {formattedDate}
        </h2>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6 ml-auto">
        
        {/* Wallet Pill */}
        <div className="hidden md:flex items-center gap-3 bg-blue-900/20 border border-blue-500/20 px-4 py-2 rounded-xl">
          <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
            <Wallet size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-300 uppercase font-bold tracking-wider leading-none mb-0.5">
              Available Balance
            </span>
            <span className="text-white font-mono font-bold text-base leading-none">
              ${balance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Profile Section */}
        <Link href="/settings/profile" className="flex items-center gap-3 pl-2 cursor-pointer group outline-none">
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
              {loading ? '...' : username}
            </div>
            <div className={`text-xs font-medium flex items-center justify-end gap-1 ${kycLabel.className}`}>
              {kycLabel.text}
            </div>
          </div>
          
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/10 group-hover:ring-blue-500/50 transition-all">
              {loading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
              ) : (
                initial || 'U'
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0b1220] rounded-full flex items-center justify-center">
              <div className={`w-2.5 h-2.5 ${kycLabel.dot} rounded-full border-2 border-[#0b1220]`}></div>
            </div>
          </div>
          
          <ChevronDown size={16} className="text-gray-500 group-hover:text-white transition-colors hidden sm:block" />
        </Link>
      </div>
    </header>
  );
}
