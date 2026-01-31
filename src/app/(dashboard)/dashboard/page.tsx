'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Added Router
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp } from 'lucide-react';
import Watchlist from '../../components/Watchlist';

export default function DashboardPage() {
  const router = useRouter(); // Initialize Router
  const [data, setData] = useState({
    name: 'User',
    balance: 0,
    profit: 0,
    profitPercent: '0',
    userId: ''
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      
      // 🚨 FIX: Redirect if no token
      if (!token) {
        console.log("No token found, redirecting...");
        router.push('/auth/login');
        return;
      }

      try {
        console.log("Fetching dashboard data...");
        const res = await fetch('/api/user/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
        });
        
        if (res.status === 401) {
             console.log("Token expired, redirecting...");
             router.push('/auth/login');
             return;
        }

        const json = await res.json();
        console.log("✅ API Response:", json); // LOOK AT THIS IN CONSOLE

        if (json.user) {
          setData({
            name: json.user.name || 'User',
            balance: json.balance ?? json.user.portfolioBalance ?? 0, 
            profit: json.profit || 0,
            profitPercent: json.profitPercent || '0',
            userId: json.user.id
          });
        }
        if (json.transactions) setTransactions(json.transactions);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false); // ✅ Always stop loading
      }
    };

    fetchData();
  }, [router]);

  if (loading) return <div className="p-10 text-white">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
            <h2 className="text-3xl font-bold font-mono">
              ${data.balance.toLocaleString()}
            </h2>
            <div className="mt-4 flex gap-3">
              <Link href="/deposit" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <ArrowDownLeft size={16} /> Deposit
              </Link>
              <Link href="/withdrawal" className="bg-black/20 hover:bg-black/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <ArrowUpRight size={16} /> Withdraw
              </Link>
            </div>
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-[#1a1f2e] border border-white/10 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <TrendingUp size={20} />
            </div>
            <span className="text-gray-400 text-sm">Total Profit</span>
          </div>
          <h2 className={`text-2xl font-bold font-mono ${data.profit > 0 ? 'text-green-400' : 'text-white'}`}>
            +${data.profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </h2>
          <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
            +{data.profitPercent}% <span className="text-gray-500">growth</span>
          </p>
        </div>

        {/* Active Assets Card */}
        <div className="bg-[#1a1f2e] border border-white/10 p-6 rounded-2xl shadow-xl">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <Wallet size={20} />
            </div>
            <span className="text-gray-400 text-sm">Active Status</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Verified</h2>
          <p className="text-xs text-gray-500 mt-1">Account is fully active</p>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Watchlist */}
        <div className="bg-[#1a1f2e] border border-white/10 p-6 rounded-2xl shadow-xl h-full">
          <h3 className="text-lg font-bold text-white mb-4">Market Watch</h3>
          <Watchlist />
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-[#1a1f2e] border border-white/10 p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
          
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500 space-y-3">
              <Wallet size={48} className="opacity-20" />
              <p>No transactions found.</p>
              <Link href="/deposit" className="text-blue-400 text-sm hover:underline">
                Make your first deposit
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10 text-xs uppercase">
                    <th className="pb-3 pl-2">Type</th>
                    <th className="pb-3">Asset</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((t: any, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors text-sm">
                      <td className="py-3 pl-2 capitalize text-white">{t.type}</td>
                      <td className="py-3 text-gray-300">{t.asset || 'USD'}</td>
                      <td className="py-3 font-mono font-medium text-white">${t.amount?.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          t.status === 'Completed' ? 'bg-green-500/10 text-green-400' :
                          t.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {t.date ? new Date(t.date).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* 🔍 DEBUG ID: Helps confirm you are editing the right user */}
      <div className="text-center pt-10 opacity-30 text-xs text-gray-500 font-mono">
        User ID: {data.userId || 'Loading...'}
      </div>

    </div>
  );
}