'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, X, AlertTriangle } from 'lucide-react';

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    status: 'Active',
    verified: 'Verified',
    portfolioBalance: 0,
    createdAt: ''
  });

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('add');
  const [processingBalance, setProcessingBalance] = useState(false);

  // 1. FIXED FETCH: Handles nested 'user' object
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${params.id}`, { cache: 'no-store' });
        const data = await res.json();
        
        console.log("RAW API DATA:", data); // Check this in console

        // 🚨 THE FIX: Check if data is inside 'user' property or direct
        const user = data.user || data; 

        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            country: user.country || '',
            status: user.status || 'Active',
            verified: user.verified ? 'Verified' : 'Unverified',
            // Handle balance coming as string or number
            portfolioBalance: Number(user.portfolioBalance) || 0,
            createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchUser();
  }, [params.id]);

  // 2. Save Profile
  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          status: formData.status,
          verified: formData.verified === 'Verified'
        })
      });
      
      if (res.ok) {
        setMessage('✅ Changes saved');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const err = await res.json();
        console.error("Save Failed:", err);
        setMessage('❌ Save failed');
      }
    } catch (error) {
      setMessage('❌ Network Error');
    } finally {
      setSaving(false);
    }
  };

  // 3. Update Balance
  const handleUpdateBalance = async () => {
    if (!amount) return;
    setProcessingBalance(true);

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
        const updatedUser = await res.json();
        // Handle nested return on balance update too
        const finalBalance = updatedUser.user ? updatedUser.user.portfolioBalance : updatedUser.portfolioBalance;
        
        setFormData(prev => ({ ...prev, portfolioBalance: Number(finalBalance) || 0 }));
        setShowBalanceModal(false);
        setAmount('');
        setMessage('✅ Balance updated');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errText = await res.text();
        console.error("Balance Update Failed:", errText);
        setMessage('❌ Update failed');
      }
    } catch (error) {
      console.error("Network Error:", error);
      setMessage('❌ Network Error');
    } finally {
      setProcessingBalance(false);
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft size={18} /> Back to Users
        </button>
        {message && (
          <div className={`px-4 py-2 rounded-lg text-sm font-bold ${message.includes('saved') || message.includes('updated') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-[#0f1522] border border-white/10 rounded-2xl p-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Full name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Email</label>
            <input 
              type="text" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Phone</label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Country</label>
            <input 
              type="text" 
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Account status</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">KYC status</label>
            <select 
              value={formData.verified}
              onChange={(e) => setFormData({...formData, verified: e.target.value})}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
            >
              <option value="Verified">Verified</option>
              <option value="Unverified">Unverified</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Balance</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#1a1f2e] border border-white/10 rounded-xl p-3 text-white font-mono">
                ${(formData.portfolioBalance).toLocaleString()}
              </div>
              <button 
                onClick={() => setShowBalanceModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 rounded-xl transition-colors"
              >
                Adjust
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Created at</label>
            <div className="w-full bg-[#1a1f2e]/50 border border-white/5 rounded-xl p-3 text-gray-500 cursor-not-allowed">
              {formData.createdAt}
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button 
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save changes
          </button>
        </div>
      </div>

      {/* Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1f2e] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#151926]">
              <h3 className="text-lg font-bold text-white">Adjust User Balance</h3>
              <button onClick={() => setShowBalanceModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5 bg-[#1a1f2e]">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Operation</label>
                <select value={action} onChange={(e) => setAction(e.target.value)} className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-3 text-white outline-none">
                  <option value="add">Add to balance</option>
                  <option value="subtract">Subtract from balance</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Amount ($)</label>
                <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-4 text-white text-xl font-mono outline-none" />
              </div>
              <div className="pt-2 flex gap-3">
                <button onClick={() => setShowBalanceModal(false)} className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300">Cancel</button>
                <button onClick={handleUpdateBalance} disabled={processingBalance || !amount} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex justify-center items-center gap-2">{processingBalance ? <Loader2 className="animate-spin" /> : 'Update Balance'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}