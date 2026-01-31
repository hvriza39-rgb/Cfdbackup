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
  
  // User Form Data
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

  // Modal State
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('add'); // 'add' or 'subtract'
  const [processingBalance, setProcessingBalance] = useState(false);

  // 1. Fetch User
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${params.id}`);
        const data = await res.json();
        if (data) {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            country: data.country || '',
            status: data.status || 'Active', // Default if missing
            verified: data.verified ? 'Verified' : 'Unverified',
            portfolioBalance: data.portfolioBalance || 0,
            createdAt: data.createdAt ? new Date(data.createdAt).toLocaleString() : 'N/A'
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [params.id]);

  // 2. Save Profile Changes
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
        setMessage('✅ Changes saved successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to save');
      }
    } catch (error) {
      setMessage('❌ Error saving changes');
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
        setFormData(prev => ({ ...prev, portfolioBalance: updatedUser.portfolioBalance }));
        setShowBalanceModal(false);
        setAmount('');
      }
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setProcessingBalance(false);
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={18} /> Back to Users
        </button>
        {message && (
          <div className={`px-4 py-2 rounded-lg text-sm font-bold ${message.includes('saved') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Main Form Card */}
      <div className="bg-[#0f1522] border border-white/10 rounded-2xl p-8 shadow-xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Full name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Email</label>
            <input 
              type="text" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Phone</label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Country</label>
            <input 
              type="text" 
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Account Status */}
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

          {/* KYC Status */}
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

          {/* Balance (With Adjust Button) */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Balance</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#1a1f2e] border border-white/10 rounded-xl p-3 text-white font-mono">
                ${(formData.portfolioBalance || 0).toLocaleString()}
              </div>
              <button 
                onClick={() => setShowBalanceModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 rounded-xl transition-colors"
              >
                Adjust
              </button>
            </div>
          </div>

          {/* Created At (Read Only) */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Created at</label>
            <div className="w-full bg-[#1a1f2e]/50 border border-white/5 rounded-xl p-3 text-gray-500 cursor-not-allowed">
              {formData.createdAt}
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button 
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save changes
          </button>
          
          <button className="bg-[#1a1f2e] hover:bg-white/5 border border-white/10 text-red-400 font-bold py-3 px-8 rounded-xl transition-all">
            Reset password
          </button>
        </div>

      </div>

      {/* 🚀 FIXED MODAL: Solid Background (No Transparency) */}
      {showBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          {/* Added 'bg-[#1a1f2e]' explicitly to make it Opaque */}
          <div className="bg-[#1a1f2e] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#151926]">
              <h3 className="text-lg font-bold text-white">Adjust User Balance</h3>
              <button onClick={() => setShowBalanceModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 bg-[#1a1f2e]"> {/* Solid Background Here Too */}
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Operation</label>
                <select 
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none"
                >
                  <option value="add">Add to balance</option>
                  <option value="subtract">Subtract from balance</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Amount ($)</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-4 text-white text-xl font-mono focus:border-blue-500 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => setShowBalanceModal(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateBalance}
                  disabled={processingBalance || !amount}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex justify-center items-center gap-2"
                >
                  {processingBalance ? <Loader2 className="animate-spin" /> : 'Update Balance'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}