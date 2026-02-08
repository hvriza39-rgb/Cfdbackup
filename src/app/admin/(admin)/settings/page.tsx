'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Wallet, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const [wallets, setWallets] = useState({
    btcAddress: '',
    ethAddress: '' // This acts as the EVM address (ETH, USDT, BNB)
  });

  // 1. Load Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data && !data.error) {
          setWallets({
            btcAddress: data.btcAddress || '',
            ethAddress: data.ethAddress || '' 
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

  // 2. Save Settings
  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wallets)
      });

      if (res.ok) {
        setMessage('✅ Settings saved successfully');
      } else {
        const errData = await res.json();
        console.error("Save failed:", errData);
        setError(true);
        setMessage('❌ Error saving settings');
      }
    } catch (err) {
      console.error("Network error:", err);
      setError(true);
      setMessage('❌ Network Error');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <h1 className="text-2xl font-bold text-white">Platform Settings</h1>

      {/* Main Card */}
      <div className="bg-[#0f1522] border border-white/10 rounded-2xl p-8 shadow-xl">
        
        {/* Title Section */}
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-blue-600/20 rounded-xl text-blue-500">
            <Wallet size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Deposit Configuration</h2>
            <p className="text-sm text-gray-400">Set the master wallet addresses for user deposits.</p>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Bitcoin Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-orange-400">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              Bitcoin Address (BTC)
            </label>
            <input 
              type="text" 
              placeholder="bc1q..."
              value={wallets.btcAddress}
              onChange={(e) => setWallets({...wallets, btcAddress: e.target.value})}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* EVM Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              EVM Address (ETH, USDT, BNB)
            </label>
            <input 
              type="text" 
              placeholder="0x..."
              value={wallets.ethAddress}
              onChange={(e) => setWallets({...wallets, ethAddress: e.target.value})}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Save Button & Message */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            {message && (
              <div className={`flex items-center gap-2 text-sm font-bold ${error ? 'text-red-400' : 'text-green-400'}`}>
                {error ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                {message}
              </div>
            )}
            
            <button 
              onClick={handleSave}
              disabled={saving}
              className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Save All Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}