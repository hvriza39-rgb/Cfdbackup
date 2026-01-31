'use client';

import { useState, useEffect } from 'react';
import { Copy, CheckCircle, Wallet, AlertTriangle, Loader2 } from 'lucide-react';
import QRCode from "react-qr-code"; // 1. Import the QR tool

export default function DepositPage() {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [adminWallets, setAdminWallets] = useState({
    btc: '',
    evm: '' 
  });

  // Updated Networks (Fixed TRC20 -> BEP20)
  const assets = [
    { id: 'BTC', name: 'Bitcoin', network: 'Bitcoin Network', icon: '₿' },
    { id: 'ETH', name: 'Ethereum', network: 'ERC20 / BEP20', icon: 'Ξ' },
    { id: 'USDT', name: 'Tether (USDT)', network: 'BEP20 / ERC20', icon: '₮' }, 
  ];

  // 1. Fetch Admin Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        const data = await res.json();
        
        if (data) {
          setAdminWallets({
            btc: data.btcAddress || '',
            evm: data.ethAddress || '' 
          });
        }
      } catch (error) {
        console.error("Failed to load wallets", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const getCurrentWalletAddress = () => {
    if (selectedAsset === 'BTC') return adminWallets.btc;
    if (selectedAsset === 'ETH' || selectedAsset === 'USDT') return adminWallets.evm;
    return '';
  };

  const handleCopy = () => {
    const addr = getCurrentWalletAddress();
    if (!addr) return;
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentAddress = getCurrentWalletAddress();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-600 rounded-xl text-white">
          <Wallet size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Deposit Funds</h1>
          <p className="text-gray-400 text-sm">Send crypto to your secure wallet address</p>
        </div>
      </div>

      {/* Asset Selection */}
      <div className="grid grid-cols-3 gap-3">
        {assets.map((asset) => (
          <button
            key={asset.id}
            onClick={() => {
              setSelectedAsset(asset.id);
              setCopied(false);
            }}
            className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
              selectedAsset === asset.id
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                : 'bg-[#1a1f2e] border-white/10 text-gray-400 hover:bg-white/5'
            }`}
          >
            <span className="text-2xl">{asset.icon}</span>
            <span className="font-bold text-sm">{asset.id}</span>
          </button>
        ))}
      </div>

      {/* Address Display Card */}
      <div className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Loader2 className="animate-spin mb-2" />
            <p>Loading wallet details...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  {assets.find(a => a.id === selectedAsset)?.name} Deposit
                </h3>
                <p className="text-blue-400 text-sm mt-1">
                  Network: {assets.find(a => a.id === selectedAsset)?.network}
                </p>
              </div>
              
              {/* 2. REAL QR CODE GENERATOR */}
              <div className="bg-white p-2 rounded-lg">
                {currentAddress ? (
                  <QRCode 
                    value={currentAddress} 
                    size={64} 
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-xs text-black font-bold">
                    ...
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase text-gray-500 font-semibold">Wallet Address</label>
              <div className="relative group">
                <div className="w-full bg-[#0b1221] border border-white/10 rounded-xl p-4 pr-12 text-gray-300 font-mono text-sm break-all">
                  {currentAddress || "Loading address..."}
                </div>
                <button 
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
              <p className="text-xs text-yellow-200/80 leading-relaxed">
                Only send <strong>{selectedAsset}</strong> to this address. Sending any other asset may result in permanent loss.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="text-center">
        <p className="text-gray-500 text-sm">
          After sending, your balance will update automatically once the transaction is confirmed on the blockchain.
        </p>
      </div>

    </div>
  );
}