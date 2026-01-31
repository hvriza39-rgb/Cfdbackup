'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, Wallet, AlertCircle, Loader2 } from 'lucide-react';

export default function WithdrawalPage() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('BTC');

  // 1. Fetch Real User Balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('/api/user/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
        });

        if (res.ok) {
          const data = await res.json();
          // Set the balance from the API
          setBalance(Number(data.user.portfolioBalance) || 0);
        }
      } catch (error) {
        console.error("Failed to load balance", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Withdrawal request submitted for processing.");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Withdraw Funds</h1>
        <p className="text-gray-400">Transfer crypto to your external wallet securely.</p>
      </div>

      {/* Main Withdrawal Card */}
      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
        
        {/* 💰 AVAILABLE BALANCE DISPLAY (FIXED) */}
        <div className="bg-[#0b1221] border border-blue-500/30 rounded-xl p-6 mb-8 flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-900/40">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Available Withdrawal Balance</p>
            {loading ? (
              <div className="h-8 w-32 bg-white/10 animate-pulse rounded"></div>
            ) : (
              <h2 className="text-3xl font-bold text-white font-mono">
                ${balance.toLocaleString()}
              </h2>
            )}
          </div>
        </div>

        {/* Withdrawal Form */}
        <form onSubmit={handleWithdraw} className="space-y-6">
          
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0b1221] border border-white/10 rounded-xl py-4 pl-8 pr-4 text-white text-lg font-mono focus:border-blue-500 outline-none transition-all"
              />
            </div>
            {/* Quick Select Buttons */}
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setBalance(prev => {
                     // Just a visual helper, doesn't actually withdraw yet
                     setAmount((prev * (pct / 100)).toFixed(2));
                     return prev; 
                  })}
                  // Actually calculating percentage of REAL balance
                  onMouseDown={() => setAmount((balance * (pct / 100)).toFixed(2))}
                  className="px-3 py-1 text-xs font-bold text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Network Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Network</label>
            <select 
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none appearance-none"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ERC20)</option>
              <option value="USDT">Tether (TRC20)</option>
            </select>
          </div>

          {/* Wallet Address Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Wallet Address</label>
            <input 
              type="text" 
              placeholder="Paste your wallet address here"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Info Box */}
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-yellow-200/80 leading-relaxed">
              Ensure the network matches your wallet address. Withdrawals are processed automatically but may take up to 24 hours for security verification.
            </p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            <ArrowRightLeft size={20} />
            Confirm Withdrawal
          </button>

        </form>
      </div>
    </div>
  );
}