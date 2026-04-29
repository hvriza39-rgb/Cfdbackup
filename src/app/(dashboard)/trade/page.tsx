'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowUp, ArrowDown, Wallet, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

export default function TradePage() {
  const [asset, setAsset] = useState('BTCUSD'); 
  const [price, setPrice] = useState<number | null>(null); 
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  
  const [bids, setBids] = useState<any[]>([]);
  const [asks, setAsks] = useState<any[]>([]);

  const baseSymbol = useMemo(() => asset.replace('USD', ''), [asset]);
  const priceFormatter = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }),
    [],
  );
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) return;

  fetch('/api/user/dashboard', {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        setBalance(Number(data.user.availableBalance) || 0);
      }
    })
    .catch(e => console.error('Balance fetch error:', e));
}, []);
   
  useEffect(() => { fetchBalance(); }, []);

  // 2. Fetch Price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setPriceLoading(true);
        setPriceError('');

        const res = await fetch(`/api/price?symbol=${baseSymbol}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Price unavailable');
        }

        const data = await res.json();
        if (typeof data?.price !== 'number') throw new Error('Invalid price response');

        const currentPrice = data.price;
        setPrice(currentPrice);

        const spread = currentPrice * 0.0005; 
        
        setAsks(Array.from({ length: 5 }, (_, i) => ({ 
          price: (currentPrice + (i + 1) * spread).toFixed(2), 
          amount: (Math.random() * 1.5).toFixed(4) 
        })).reverse());

        setBids(Array.from({ length: 5 }, (_, i) => ({ 
          price: (currentPrice - (i + 1) * spread).toFixed(2), 
          amount: (Math.random() * 1.5).toFixed(4) 
        })));
      } catch (err) {
        setPriceError(err instanceof Error ? err.message : 'Price unavailable');
      }
      setPriceLoading(false);
    };

    fetchPrice(); 
    const interval = setInterval(fetchPrice, 510000); 
    return () => clearInterval(interval);
  }, [asset, baseSymbol]);

  // 3. Handle Trade Execution
  const handleTrade = async () => {
    const numAmount = Number(amount);

    if (!amount || numAmount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    if (price === null) {
      toast.error('Price unavailable');
      return;
    }

    // ✅ FIXED: compare numbers properly, with debug info
    console.log('Trade check — amount:', numAmount, 'balance:', balance, 'type:', typeof balance);

    if (orderType === 'BUY' && numAmount > balance) {
      toast.error(`Insufficient balance. You have $${balance.toLocaleString()} available.`);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/transaction/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: orderType,
          asset: asset.replace('USD', ''), 
          amount: numAmount,
          price
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Trade Failed');

      toast.success(`${orderType} Order Filled!`, {
        icon: orderType === 'BUY' ? '🚀' : '💰',
        style: {
          background: '#1a1f2e',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      });
      
      setAmount('');
      fetchBalance(); 

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Set amount by percentage
  const setPercentage = (pct: number) => {
    if (orderType === 'BUY') {
      setAmount((balance * pct).toFixed(2));
    } else {
      toast('For SELL, enter the crypto amount manually');
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] p-4 flex flex-col lg:flex-row gap-4 text-white overflow-hidden">
      <Toaster position="bottom-right" />

      {/* LEFT COLUMN: CHART & INFO */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        
        {/* Header Ticker */}
        <div className="bg-[#1a1f2e] border border-white/10 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {asset}
              </h2>
              <span className="text-xs text-blue-400 font-mono">Perpetual Contract</span>
            </div>
            <div className="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>
            <div className="text-2xl font-mono font-bold text-white">
              {priceLoading && !price ? (
                'Loading...'
              ) : priceError ? (
                'Price unavailable'
              ) : price !== null ? (
                priceFormatter.format(price)
              ) : (
                '---'
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 bg-[#1a1f2e] border border-white/10 rounded-xl overflow-hidden relative shadow-2xl">
          <iframe
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_76d87&symbol=${asset}&interval=15&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${asset}`}
            className="w-full h-full border-0 absolute inset-0"
            allowTransparency={true}
            scrolling="no"
          ></iframe>
        </div>
      </div>

      {/* RIGHT COLUMN: ORDER FORM & ORDER BOOK */}
      <div className="w-full lg:w-[320px] flex flex-col gap-4">
        
        {/* ORDER FORM */}
        <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-5 shadow-xl">
          
          {/* Buy/Sell Toggle */}
          <div className="flex bg-[#0b1220] p-1 rounded-lg mb-6">
            <button 
              onClick={() => setOrderType('BUY')}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
                orderType === 'BUY' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              BUY
            </button>
            <button 
              onClick={() => setOrderType('SELL')}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
                orderType === 'SELL' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              SELL
            </button>
          </div>

          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-500 flex items-center gap-1">
              <Wallet size={12}/> Avail. Balance
            </span>
            <span className="text-white font-mono">${balance.toLocaleString()}</span>
          </div>

          <div className="bg-[#0b1220] border border-white/10 rounded-lg p-3 mb-4 flex items-center justify-between focus-within:border-blue-500 transition-colors">
            <span className="text-gray-500 text-sm">Amount</span>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent text-right text-white font-mono outline-none w-24"
              placeholder="0.00"
            />
            <span className="text-gray-400 text-xs ml-2">USD</span>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            {[0.25, 0.50, 0.75, 1].map((pct) => (
              <button 
                key={pct} 
                onClick={() => setPercentage(pct)}
                className="bg-[#0b1220] hover:bg-white/10 text-gray-400 hover:text-white text-[10px] py-1 rounded border border-white/5 transition-colors"
              >
                {pct * 100}%
              </button>
            ))}
          </div>

          <button 
            onClick={handleTrade}
            disabled={loading || price === null}
            className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              orderType === 'BUY' 
                ? 'bg-green-600 hover:bg-green-500 shadow-green-900/20' 
                : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
            }`}
          >
            {loading ? <Loader2 className="animate-spin mx-auto"/> : `${orderType} ${baseSymbol}`}
          </button>
        </div>

        {/* ORDER BOOK */}
        <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 flex-1 shadow-xl overflow-hidden flex flex-col">
          <h3 className="text-xs font-bold text-gray-400 mb-3 flex justify-between">
            <span>Price (USD)</span>
            <span>Amount (BTC)</span>
          </h3>

          <div className="flex-1 flex flex-col justify-end gap-1 mb-2 overflow-hidden">
            {asks.map((ask, i) => (
              <div key={i} className="flex justify-between text-xs font-mono relative">
                <span className="text-red-400 relative z-10">{ask.price}</span>
                <span className="text-gray-300 relative z-10">{ask.amount}</span>
                <div className="absolute right-0 top-0 bottom-0 bg-red-500/10" style={{ width: `${Math.random() * 80}%` }}></div>
              </div>
            ))}
          </div>

          <div className="text-center py-2 text-lg font-mono font-bold border-y border-white/5 my-1 text-white">
            {price !== null ? price.toFixed(2) : '---'} <ArrowUp size={14} className="inline text-green-500"/>
          </div>

          <div className="flex-1 flex flex-col justify-start gap-1 mt-2 overflow-hidden">
            {bids.map((bid, i) => (
              <div key={i} className="flex justify-between text-xs font-mono relative">
                <span className="text-green-400 relative z-10">{bid.price}</span>
                <span className="text-gray-300 relative z-10">{bid.amount}</span>
                <div className="absolute right-0 top-0 bottom-0 bg-green-500/10" style={{ width: `${Math.random() * 80}%` }}></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
