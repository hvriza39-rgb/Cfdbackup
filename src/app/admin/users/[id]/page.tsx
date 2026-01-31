'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Wallet, 
  Loader2, 
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('add'); // 'add' or 'subtract'
  const [processing, setProcessing] = useState(false);

  // 1. Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${params.id}`);
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [params.id]);

  // 2. Handle Balance Update
  const handleUpdateBalance = async () => {
    if (!amount) return;
    setProcessing(true);

    try {
      const res = await fetch(`/api/admin/users/${params.id}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: parseFloat(amount), 
          type: action 
        }),
      });

      if (res.ok) {
        // Refresh local data immediately
        const updatedUser = await res.json();
        setUser(updatedUser); 
        setShowBalanceModal(false);
        setAmount('');
      }
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-10 text-white">Loading user details...</div>;
  if (!user) return <div className="p-10 text-white">User not found</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      
      {/* Header */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
      >
        <ArrowLeft size={18} /> Back to Users
      </button>

      {/* User Profile Card */}
      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 border-b border-white/10 pb-8">
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-900/50">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
            <p className="text-gray-400 text-sm mb-3">User ID: {user.id}</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 flex items-center gap-1">
                <Shield size={12} /> {user.status || 'Verified'}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs uppercase text-gray-500 font-semibold">Email Address</label>
            <div className="flex items-center gap-3 text-white bg-[#0b1221] p-3 rounded-xl border border-white/5">
              <Mail size={18} className="text-blue-400" />
              {user.email}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase text-gray-500 font-semibold">Phone Number</label>
            <div className="flex items-center gap-3 text-white bg-[#0b1221] p-3 rounded-xl border border-white/5">
              <Phone size={18} className="text-blue-400" />
              {user.phone || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase text-gray-500 font-semibold">Country</label>
            <div className="flex items-center gap-3 text-white bg-[#0b1221] p-3 rounded-xl border border-white/5">
              <MapPin size={18} className="text-blue-400" />
              {user.country || 'N/A'}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase text-gray-500 font-semibold">Wallet Balance</label>
            <div className="flex items-center justify-between text-white bg-gradient-to-r from-blue-900/40 to-[#0b1221] p-3 rounded-xl border border-blue-500/30">
              <div className="flex items-center gap-3">
                <Wallet size={18} className="text-blue-400" />
                <span className="font-mono text-xl font-bold">${(user.portfolioBalance || 0).toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setShowBalanceModal(true)}
                className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors"
              >
                Adjust
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 FIXED MODAL: Clean Layout & No Overlap */}
      {showBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1f2e] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#151926]">
              <h3 className="text-lg font-bold text-white">Adjust Balance</h3>
              <button onClick={() => setShowBalanceModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-300 uppercase font-bold mb-1">Current Balance</p>
                <p className="text-2xl font-mono text-white">${(user.portfolioBalance || 0).toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Action</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setAction('add')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      action === 'add' 
                        ? 'bg-green-500/20 border-green-500 text-green-400' 
                        : 'bg-[#0b1221] border-white/10 text-gray-400'
                    }`}
                  >
                    <CheckCircle size={16} /> Add Funds
                  </button>
                  <button 
                    onClick={() => setAction('subtract')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      action === 'subtract' 
                        ? 'bg-red-500/20 border-red-500 text-red-400' 
                        : 'bg-[#0b1221] border-white/10 text-gray-400'
                    }`}
                  >
                    <AlertTriangle size={16} /> Deduct
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Amount ($)</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-3 text-white text-lg font-mono focus:border-blue-500 outline-none"
                />
              </div>

              {/* Modal Footer (Buttons Row) */}
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setShowBalanceModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateBalance}
                  disabled={processing || !amount}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex justify-center items-center gap-2"
                >
                  {processing ? <Loader2 className="animate-spin" /> : 'Confirm Update'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}