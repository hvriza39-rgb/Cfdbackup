'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Activity,
  ChevronRight 
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState({
    name: 'User',
    balance: 0,
    profit: 0,
    verified: false
  });
  const [loading, setLoading] = useState(true);

  // 1. Fetch Latest Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('/api/user/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser({
              name: data.user.name || 'User',
              balance: Number(data.user.portfolioBalance) || 0,
              profit: Number(data.user.totalProfit) || 0,
              verified: data.user.verified || false
            });
          }
        }
      } catch (error) {
        console.error("Dashboard Load Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* 1. WELCOME SECTION */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user.name}
        </h1>

      </div>

      {/* 2. MAIN STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: BALANCE & ACTIONS (The Fix is Here) */}
        {/* CARD 1: BALANCE & ACTIONS (Clean Icon Version) */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 md:p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
          
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
          
          <div className="relative z-10">
            <p className="text-blue-100 font-medium mb-1">Total Balance</p>
            <h2 className="text-4xl md:text-5xl font-bold font-mono tracking-tight mb-8">
              ${user.balance.toLocaleString()}
            </h2>

            {/* ✅ FIXED: Clean Circular Action Buttons */}
            <div className="flex items-center gap-8">
              
              {/* Deposit Action */}
              <Link href="/deposit" className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 bg-white/20 hover:bg-white/30 border border-white/10 backdrop-blur-md rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
                  <ArrowDownLeft size={24} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-blue-100 group-hover:text-white transition-colors">Deposit</span>
              </Link>
              
              {/* Withdraw Action */}
              <Link href="/withdrawal" className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 bg-white text-blue-600 hover:bg-blue-50 border border-white/10 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
                  <ArrowUpRight size={24} />
                </div>
                <span className="text-sm font-semibold text-blue-100 group-hover:text-white transition-colors">Withdraw</span>
              </Link>

            </div>

          

            {/* ✅ FIXED: Use Flexbox instead of Grid to prevent overlap */}
            <div className="flex flex-col sm:flex-row gap-4">
              
              <Link href="/deposit" className="flex-1">
                <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all group">
                  <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-45 transition-transform">
                    <ArrowDownLeft size={18} />
                  </div>
                  <span className="font-semibold">Deposit</span>
                </button>
              </Link>
              
              <Link href="/withdrawal" className="flex-1">
                <button className="w-full bg-white text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/10 group">
                  <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600 group-hover:-rotate-45 transition-transform">
                    <ArrowUpRight size={18} />
                  </div>
                  <span className="font-semibold">Withdraw</span>
                </button>
              </Link>
            </div>

          </div>
        </div>

        {/* CARD 2: PROFIT STATS */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-center">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-gray-400 font-medium">Total Profit</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                +${user.profit.toLocaleString()}
              </h3>
            </div>
          </div>
          <div className="mt-auto">
             <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full w-[75%] bg-green-500 rounded-full"></div>
             </div>
             <p className="text-xs text-green-400 mt-2 font-medium">+15.0% growth this month</p>
          </div>
        </div>

        {/* CARD 3: ACCOUNT STATUS */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-center">
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-3 rounded-2xl ${user.verified ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
              <Activity size={28} />
            </div>
            <div>
              <p className="text-gray-400 font-medium">Account Status</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {user.verified ? 'Verified' : 'Unverified'}
              </h3>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            {user.verified 
              ? "Your account is fully active. You have access to all trading features and unlimited withdrawals." 
              : "Please complete your KYC verification to unlock higher withdrawal limits."}
          </p>
        </div>

      </div>

      {/* 3. RECENT ACTIVITY (Placeholder) */}
      <div className="bg-[#1a1f2e] border border-white/5 rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
          <Link href="/settings/account" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        
        {/* Empty State / List */}
        <div className="space-y-4">
           {/* Static example item */}
           <div className="flex items-center justify-between p-4 bg-[#0b1221] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
                    <ArrowDownLeft size={20} />
                 </div>
                 <div>
                    <p className="text-white font-bold">Deposit (USD)</p>
                    <p className="text-xs text-gray-500">Jan 24, 2026</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-white font-mono font-bold">+$5,000.00</p>
                 <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">COMPLETED</span>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
}