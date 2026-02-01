'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertCircle, 
  Search, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Wallet
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    pendingWithdrawals: 0,
    activeUsers: 0
  });
  
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Admin Data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token'); // Or admin token if you separate them
        // Assuming you have an endpoint like /api/admin/dashboard
        // If not, you can create it later. For now, this will load the UI.
        const res = await fetch('/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || { totalUsers: 0, totalDeposits: 0, pendingWithdrawals: 0, activeUsers: 0 });
          setWithdrawals(data.pendingWithdrawals || []);
        }
      } catch (error) {
        console.error("Admin Load Error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Overview of platform performance and pending actions.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#1a1f2e] border border-white/10 p-2 rounded-xl">
          <Search size={20} className="text-gray-400 ml-2" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="bg-transparent border-none text-white outline-none placeholder-gray-500 w-64"
          />
        </div>
      </div>

      {/* 2. KEY METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Users */}
        <div className="bg-[#1a1f2e] border border-white/5 p-6 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Users</p>
            <h3 className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</h3>
          </div>
        </div>

        {/* Total Deposits */}
        <div className="bg-[#1a1f2e] border border-white/5 p-6 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-4 bg-green-500/10 text-green-400 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Deposits</p>
            <h3 className="text-2xl font-bold text-white">${stats.totalDeposits.toLocaleString()}</h3>
          </div>
        </div>

        {/* Pending Withdrawals (Action Needed) */}
        <div className="bg-[#1a1f2e] border border-orange-500/20 p-6 rounded-2xl shadow-xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 p-3 opacity-10">
            <AlertCircle size={100} className="text-orange-500" />
          </div>
          <div className="p-4 bg-orange-500/10 text-orange-400 rounded-xl z-10">
            <AlertCircle size={24} />
          </div>
          <div className="z-10">
            <p className="text-orange-200 text-sm font-medium">Pending Withdrawals</p>
            <h3 className="text-2xl font-bold text-white">{stats.pendingWithdrawals}</h3>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-[#1a1f2e] border border-white/5 p-6 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-xl">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Active Wallets</p>
            <h3 className="text-2xl font-bold text-white">{stats.activeUsers}</h3>
          </div>
        </div>
      </div>

      {/* 3. PENDING ACTIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pending Withdrawals List */}
        <div className="lg:col-span-2 bg-[#1a1f2e] border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowUpRight size={20} className="text-orange-400" /> 
              Withdrawal Requests
            </h3>
            <button className="text-sm text-blue-400 hover:text-white transition-colors">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase border-b border-white/5">
                  <th className="pb-4 pl-2">User</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Network</th>
                  <th className="pb-4">Address</th>
                  <th className="pb-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {/* Fallback if empty */}
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No pending withdrawals found.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-2 font-medium text-white">{tx.user?.name || 'Unknown'}</td>
                      <td className="py-4 font-mono text-white">${tx.amount.toLocaleString()}</td>
                      <td className="py-4 text-gray-400 text-sm">{tx.network}</td>
                      <td className="py-4">
                        <span className="text-xs text-gray-500 font-mono bg-black/30 px-2 py-1 rounded">
                          {tx.address ? `${tx.address.substring(0,6)}...${tx.address.substring(tx.address.length-4)}` : 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 text-right flex items-center justify-end gap-2">
                        <button className="p-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-all" title="Approve">
                          <CheckCircle size={18} />
                        </button>
                        <button className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all" title="Reject">
                          <XCircle size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity / System Logs */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-6">
            
            {/* Mock Activity Item */}
            <div className="flex gap-4 relative">
              <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-white/5"></div>
              <div className="z-10 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              </div>
              <div>
                <p className="text-sm text-gray-300">New user registration</p>
                <p className="text-xs text-gray-500 mt-1">John Doe joined via referral</p>
                <p className="text-[10px] text-gray-600 mt-2 font-mono">2 mins ago</p>
              </div>
            </div>

            <div className="flex gap-4 relative">
              <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-white/5"></div>
              <div className="z-10 w-6 h-6 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
              <div>
                <p className="text-sm text-gray-300">Deposit Confirmed</p>
                <p className="text-xs text-gray-500 mt-1">+$5,000.00 BTC (User: Sarah)</p>
                <p className="text-[10px] text-gray-600 mt-2 font-mono">15 mins ago</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="z-10 w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              </div>
              <div>
                <p className="text-sm text-gray-300">New Withdrawal Request</p>
                <p className="text-xs text-gray-500 mt-1">User requested $1,200 via ETH</p>
                <p className="text-[10px] text-gray-600 mt-2 font-mono">1 hour ago</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}