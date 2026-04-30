'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Wallet, 
  Activity,
  Loader2,
  ArrowDownLeft, // Added missing imports
  ArrowUpRight   // Added missing imports
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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
          setUser(data.user);
          setTransactions(data.transactions || []);
        }
      } catch (error) {
        console.error("Dashboard Load Error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-white flex items-center gap-2"><Loader2 className="animate-spin"/> Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name || 'Trader'}</h1>
          <p className="text-gray-400">your portfolio</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-100 font-medium mb-1">Total Balance</p>
            <h2 className="text-4xl font-bold font-mono mb-4">
              ${user?.portfolioBalance?.toLocaleString() || '0.00'}
            </h2>
            <div className="flex gap-3">
              <Link 
                href="/deposit" 
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-bold transition-all backdrop-blur-sm text-center inline-block"
              >
                Deposit
              </Link>
              <Link 
                href="/withdrawal" 
                className="bg-black/20 hover:bg-black/30 px-4 py-2 rounded-lg text-sm font-bold transition-all backdrop-blur-sm text-center inline-block"
              >
                Withdraw
              </Link>
            </div>
          </div>
          <Wallet className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32" />
        </div>

        {/* Profit Card (NOW MATCHES BALANCE) */}
        <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
              <TrendingUp size={24} />
            </div>
            <span className="text-green-400 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-lg">+15.0%</span>
          </div>
          <p className="text-gray-400 text-sm">Total Profit</p>
          {/* ✅ UPDATED: Uses portfolioBalance variable instead of hardcoded number */}
          <h3 className="text-2xl font-bold text-white mt-1">
            ${user?.portfolioBalance?.toLocaleString() || '0.00'}
          </h3>
        </div>

        {/* Active Trades Card */}
        <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <Activity size={24} />
            </div>
            <span className="text-gray-400 text-xs font-bold">Active</span>
          </div>
          <p className="text-gray-400 text-sm">Open Positions</p>
          <h3 className="text-2xl font-bold text-white mt-1">{transactions.length} Trades</h3>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
          <span className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">View All</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-white/5">
                <th className="pb-4 font-medium">Type</th>
                <th className="pb-4 font-medium">Asset</th>
                <th className="pb-4 font-medium">Date</th>
                <th className="pb-4 font-medium text-right">Amount</th>
                <th className="pb-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No recent transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx: any) => (
                  <tr key={tx.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tx.type === 'Deposit' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {tx.type === 'Deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <span className="text-white font-medium">{tx.type}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-400 text-sm">{tx.asset || 'USD'}</td>
                    <td className="py-4 text-gray-500 text-xs">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right font-mono text-white font-bold">
                      ${tx.amount.toLocaleString()}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg uppercase ${
                        tx.status === 'Success' ? 'bg-green-500/10 text-green-400' : 
                        tx.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' : 
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
