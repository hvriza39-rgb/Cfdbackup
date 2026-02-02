'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Loader2 
} from 'lucide-react';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch Transactions
  async function fetchTransactions() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/transactions', { cache: 'no-store' }); // Ensure you have this GET route
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle Approve/Reject
  async function handleProcess(id: string, action: 'approve' | 'reject') {
    if (!confirm(`Are you sure you want to ${action} this transaction?`)) return;
    setProcessingId(id);

    try {
      const res = await fetch('/api/admin/transactions/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id, action }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Transaction ${action}ed successfully!`);
        fetchTransactions(); // Refresh list
      } else {
        alert(data.error || 'Operation failed');
      }
    } catch (error) {
      alert('Network error');
    } finally {
      setProcessingId(null);
    }
  }

  // Filter Logic
  const filteredTransactions = transactions.filter((tx: any) => 
    filter === 'All' ? true : tx.type === filter
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <p className="text-gray-400">Monitor and process deposits and withdrawals.</p>
        </div>
        <button 
          onClick={fetchTransactions}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1f2e] text-white border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['All', 'Deposit', 'Withdrawal'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#1a1f2e] text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-xs text-gray-400 uppercase tracking-wider">
                <th className="p-4">Date</th>
                <th className="p-4">User</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No transactions found</td></tr>
              ) : (
                filteredTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                       <div>
                         <p className="text-white font-bold text-sm">{tx.user?.name || 'Unknown'}</p>
                         <p className="text-xs text-gray-500">{tx.user?.email}</p>
                       </div>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-2 text-sm font-medium ${tx.type === 'Deposit' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.type === 'Deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-white font-bold">
                      ${tx.amount.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                        tx.status === 'Success' ? 'bg-green-500/10 text-green-400' :
                        tx.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    
                    {/* ACTION BUTTONS */}
                    <td className="p-4 text-center">
                      {tx.status === 'Pending' ? (
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleProcess(tx.id, 'approve')}
                            disabled={!!processingId}
                            className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                            title="Approve"
                          >
                            {processingId === tx.id ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18} />}
                          </button>
                          <button 
                            onClick={() => handleProcess(tx.id, 'reject')}
                            disabled={!!processingId}
                            className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                            title="Reject"
                          >
                             {processingId === tx.id ? <Loader2 size={18} className="animate-spin"/> : <XCircle size={18} />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
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