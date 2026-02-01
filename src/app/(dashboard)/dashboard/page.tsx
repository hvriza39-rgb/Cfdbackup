'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  ChevronRight,
  Bitcoin,
  Activity
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
        <p className="text-gray-400 mt-1">Here is your portfolio overview for today.</p>
      </div>

      {/* 2. MAIN STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: BALANCE & ACTIONS (Preferred Layout) */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden flex flex-col justify-between min-h-[240px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
          
          <div className="relative z-10">
            <p className="text-blue-100 font-medium mb-1">Total Balance</p>
            <h2 className="text-4xl lg:text-5xl font-bold font-mono tracking-tight">
              ${user.balance.toLocaleString()}
            </h2>
          </div>

          {/* ACTIONS: Side-by-Side Buttons */}
          <div className="relative z-10 flex items-center gap-3 mt-6">
            <Link href="/deposit" className="flex-1">
              <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all group">
                <ArrowDownLeft size={18} className="text-blue-100" />
                <span className="font-semibold text-sm">Deposit</span>
              </button>
            </Link>
            <Link href="/withdrawal" className="flex-1">
              <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all group">
                <ArrowUpRight size={18} className="text-blue-100" />
                <span className="font-semibold text-sm">Withdraw</span>
              </button>
            </Link>
          </div>
        </div>

        {/* CARD 2: PROFIT STATS */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[240px]">
          <div className="flex items-start gap-4">
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
          <div>
             <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full w-[75%] bg-green-500 rounded-full"></div>
             </div>
             <p className="text-xs text-green-400 mt-2 font-medium">+15.0% growth this month</p>
          </div>
        </div>

        {/* CARD 3: LIVE WATCHLIST (Replaces KYC Card) */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col min-h-[240px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-blue-500" /> Market Watch
            </h3>
            <span className="text-xs text-green-400 animate-pulse">● Live</span>
          </div>

          <div className="flex-1 space-y-3">
            {/* BTC */}
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-xs">₿</div>
                  <div>
                    <p className="text-sm font-bold text-white">Bitcoin</p>
                    <p className="text-xs text-gray-500">BTC</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-sm font-mono text-white">$43,250</p>
                  <p className="text-xs text-green-400">+2.4%</p>
               </div>
            </div>

            {/* ETH */}
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold text-xs">Ξ</div>
                  <div>
                    <p className="text-sm font-bold text-white">Ethereum</p>
                    <p className="text-xs text-gray-500">ETH</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-sm font-mono text-white">$2,280</p>
                  <p className="text-xs text-red-400">-0.8%</p>
               </div>
            </div>

            {/* SOL */}
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs">S</div>
                  <div>
                    <p className="text-sm font-bold text-white">Solana</p>
                    <p className="text-xs text-gray-500">SOL</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-sm font-mono text-white">$98.50</p>
                  <p className="text-xs text-green-400">+5.2%</p>
               </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. RECENT ACTIVITY TABLE */}
      <div className="bg-[#1a1f2e] border border-white/5 rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
          <Link href="/settings/account" className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">
            View All <ChevronRight size={16} />
          </Link>
        </div>
        
        {/* Table Header */}
        <div className="grid grid-cols-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-4">
            <div>Type</div>
            <div>Asset</div>
            <div>Amount</div>
            <div className="text-right">Status</div>
        </div>

        {/* Example Rows */}
        <div className="space-y-2">
           <div className="grid grid-cols-4 items-center p-4 bg-[#0b1221] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="text-white font-medium">Deposit</div>
              <div className="text-gray-400 text-sm">USD</div>
              <div className="text-white font-mono font-bold">$5,000.00</div>
              <div className="text-right">
                 <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">COMPLETED</span>
              </div>
           </div>

           <div className="grid grid-cols-4 items-center p-4 bg-[#0b1221] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="text-white font-medium">Trade (Buy)</div>
              <div className="text-gray-400 text-sm">BTC</div>
              <div className="text-white font-mono font-bold">0.05 BTC</div>
              <div className="text-right">
                 <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">COMPLETED</span>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
}