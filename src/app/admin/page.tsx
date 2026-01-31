'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Wallet, CheckCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [wallets, setWallets] = useState({
    btcAddress: '',
    ethAddress: '',
    usdtAddress: ''
  });

  // 1. Fetch Current Wallets
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data && !data.error) {
          setWallets({
            btcAddress: data.btcAddress || '',
            ethAddress: data.ethAddress || '',
            usdtAddress: data.usdtAddress || ''
          });
        }
      } catch (err) {
        console.error("Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 2. Save Changes
  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wallets)
      });

      if (res.ok) {
        setMessage('✅ Wallets saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to save.');
      }
    } catch (err) {
      setMessage('❌ Network error.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-white">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        {message && (
          <div className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${message.includes('saved') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {message.includes('saved') && <CheckCircle size={16} />}
            {message}
          </div>
        )}
      </div>

      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Wallet size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Deposit Wallets</h2>
            <p className="text-sm text-gray-400">Set the receiving addresses for user deposits</p>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Bitcoin */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Bitcoin (BTC) Address</label>
            <input 
              type="text" 
              placeholder="bc1qxy2kgdygjk..."
              value={wallets.btcAddress}
              onChange={(e) => setWallets({...wallets, btcAddress: e.target.value})}
              className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-4 text-white font-mono focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Ethereum */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Ethereum (ETH) Address</label>
            <input 
              type="text" 
              placeholder="0x71C..."
              value={wallets.ethAddress}
              onChange={(e) => setWallets({...wallets, ethAddress: e.target.value})}
              className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-4 text-white font-mono focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* USDT */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">USDT (TRC20/ERC20) Address</label>
            <input 
              type="text" 
              placeholder="T9yD14Nj9j..."
              value={wallets.usdtAddress}
              onChange={(e) => setWallets({...wallets, usdtAddress: e.target.value})}
              className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-4 text-white font-mono focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="pt-4 border-t border-white/10">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Save Wallets
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}