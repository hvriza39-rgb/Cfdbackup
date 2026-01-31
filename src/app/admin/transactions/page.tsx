'use client';

import { useState, useEffect } from 'react';
import { Search, ArrowDownLeft, ArrowUpRight, RefreshCw, Filter } from 'lucide-react';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // All, Deposit, Withdrawal, Trade

  // 1. Fetch Data
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/transactions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (error) {
      console.error("Failed to load transactions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 2. Filter Logic
  const filtered = transactions.filter((t: any) => 
    filter === 'All' ? true : t.type === filter
  );

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <p className="text-gray-400">Monitor all user deposits and withdrawals.</p>
        </div>
        <button 
          onClick={fetchTransactions}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1f2e] hover:bg-[#252b3d] text-white rounded-lg border border-white/10 transition-all"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Deposit', 'Withdrawal', 'Trade'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#1a1f2e] text-gray-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1a1f2e] rounded-xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 text-gray-400 text-xs uppercase font-semibold">
                <th className="p-4">Date</th>
                <th className="p-4">User</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Asset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading records...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No transactions found.</td>
                </tr>
              ) : (
                filtered.map((t: any) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-gray-400 text-sm whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString()} <span className="text-gray-600 text-xs">{new Date(t.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{t.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{t.user?.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        t.type === 'Deposit' ? 'bg-green-500/10 text-green-400' :
                        t.type === 'Withdrawal' ? 'bg-red-500/10 text-red-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {t.type === 'Deposit' && <ArrowDownLeft size={12} />}
                        {t.type === 'Withdrawal' && <ArrowUpRight size={12} />}
                        {t.type}
                      </span>
                    </td>
                    <td className="p-4 text-white font-mono font-medium">
                      ${t.amount?.toLocaleString()}
                    </td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          t.status === 'Completed' ? 'bg-green-500/10 text-green-400' :
                          t.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {t.status}
                        </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {t.asset || 'USD'}
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