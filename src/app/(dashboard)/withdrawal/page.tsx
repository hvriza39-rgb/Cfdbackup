'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, Wallet, AlertCircle, Loader2, CheckCircle, XCircle, Lock } from 'lucide-react';

export default function WithdrawalPage() {
  const [balance, setBalance] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const [loadingBalance, setLoadingBalance] = useState(true);
  
  // Form State
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState(''); // 👈 New Password State
  const [network, setNetwork] = useState('BTC');
  
  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('/api/user/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-store'
        });

        if (res.ok) {
          const data = await res.json();
          setBalance(Number(data.user.portfolioBalance) || 0);
          setUserEmail(data.user.email);
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchUserData();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token || !userEmail) {
        setIsError(true);
        setMessage('Session invalid. Please login again.');
        setIsSubmitting(false);
        return;
      }

      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Please enter a valid amount.');
      }
      if (!password) {
        throw new Error('Please enter your password to confirm.');
      }

      const res = await fetch('/api/user/withdrawal', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // 👇 Sending 'password' to backend
        body: JSON.stringify({ 
            amount: numericAmount, 
            network, 
            address, 
            email: userEmail,
            password: password 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setBalance(data.newBalance);
        setAmount('');
        setAddress('');
        setPassword(''); // Clear password field
        setIsError(false);
        setMessage('Withdrawal request submitted successfully!');
      } else {
        setIsError(true);
        setMessage(data.error || 'Withdrawal failed.');
      }
    } catch (error: any) {
      setIsError(true);
      setMessage(error.message || 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Withdraw Funds</h1>
        <p className="text-gray-400">Transfer crypto to your external wallet securely.</p>
      </div>

      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl">
        
        <div className="bg-[#0b1221] border border-blue-500/30 rounded-xl p-6 mb-8 flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-900/40">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-medium mb-1">Available Withdrawal Balance</p>
            {loadingBalance ? (
              <div className="h-8 w-32 bg-white/10 animate-pulse rounded"></div>
            ) : (
              <h2 className="text-3xl font-bold text-white font-mono">
                ${balance.toLocaleString()}
              </h2>
            )}
          </div>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-6">
          
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
                required
              />
            </div>
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onMouseDown={() => setAmount((balance * (pct / 100)).toFixed(2))}
                  className="px-3 py-1 text-xs font-bold text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

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

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Wallet Address</label>
            <input 
              type="text" 
              placeholder="Paste your wallet address here"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          {/* ✅ NEW PASSWORD FIELD */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Confirm Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Lock size={18} />
              </span>
              <input 
                type="password" 
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-4 pl-12 text-white focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${isError ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
              {isError ? <XCircle size={20} /> : <CheckCircle size={20} />}
              <span className="text-sm font-bold">{message}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting || !amount || !password}
            className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 ${
              isSubmitting 
                ? 'bg-blue-800 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <ArrowRightLeft size={20} />}
            {isSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
          </button>

        </form>
      </div>
    </div>
  );
}