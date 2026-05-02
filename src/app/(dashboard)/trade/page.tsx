'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowUp, Wallet, Loader2, ChevronDown, Search } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const ALL_ASSETS = [
  // ... existing assets ...
  { symbol: 'CL1!', name: 'Crude Oil', type: 'COMMODITIES' },
  { symbol: 'XAUUSD', name: 'Gold', type: 'COMMODITIES' },
  { symbol: 'EURUSD', name: 'Euro / US Dollar', type: 'FOREX' },
  { symbol: 'GBPUSD', name: 'British Pound / USD', type: 'FOREX' },
  { symbol: 'USDJPY', name: 'US Dollar / Yen', type: 'FOREX' },
 
  { symbol: 'BTCUSD', name: 'Bitcoin', type: 'CRYPTO' },
  { symbol: 'ETHUSD', name: 'Ethereum', type: 'CRYPTO' },
  { symbol: 'SOLUSD', name: 'Solana', type: 'CRYPTO' },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'STOCKS' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'STOCKS' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'STOCKS' },
  { symbol: 'AMZN', name: 'Amazon.com', type: 'STOCKS' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'STOCKS' },
];

export default function TradePage() {
  const [asset, setAsset] = useState('BTCUSD'); 
  const [price, setPrice] = useState<number | null>(null); 
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  
  // --- Asset Selector States ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Leverage States ---
  const [leverage, setLeverage] = useState(1);
  const [marginType, setMarginType] = useState<'ISOLATED' | 'CROSS'>('ISOLATED');

  const [bids, setBids] = useState<any[]>([]);
  const [asks, setAsks] = useState<any[]>([]);

  const activeAsset = useMemo(() => ALL_ASSETS.find(a => a.symbol === asset), [asset]);
  const baseSymbol = useMemo(() => asset.replace('USD', ''), [asset]);
  
  const filteredAssets = useMemo(() => 
    ALL_ASSETS.filter(a => 
      a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]
  );

  const priceFormatter = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }),
    [],
  );

  const positionSize = useMemo(() => Number(amount) * leverage, [amount, leverage]);
  const requiredMargin = useMemo(() => Number(amount), [amount]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchBalance = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    fetch('/api/user/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    })
      .then(res => res.json())
      .then(data => { if (data.user) setBalance(Number(data.user.portfolioBalance) || 0); })
      .catch(e => console.error('Balance fetch error:', e));
  };

  useEffect(() => { fetchBalance(); }, []);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setPriceLoading(true);
        setPriceError('');
        const res = await fetch(`/api/price?symbol=${baseSymbol}`);
        if (!res.ok) throw new Error('Price unavailable');
        const data = await res.json();
        
        const currentPrice = data.price;
        setPrice(currentPrice);
        
        // Mock Order Book Logic
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
        setPriceError('Price unavailable'); 
      } finally {
        setPriceLoading(false);
      }
    };
    fetchPrice(); 
    const interval = setInterval(fetchPrice, 30000); 
    return () => clearInterval(interval);
  }, [asset, baseSymbol]);

  // Percentage Button Helper
  const setPercentage = (pct: number) => {
    if (orderType === 'BUY') {
      setAmount((balance * pct).toFixed(2));
    } else {
      toast.error('Enter sell amount manually based on holdings');
    }
  };

  const handleTrade = async () => {
    const numAmount = Number(amount);
    const token = localStorage.getItem('token');
    if (!amount || numAmount <= 0) return toast.error('Enter a valid amount');
    if (price === null) return toast.error('Price unavailable');
    if (orderType === 'BUY' && numAmount > balance) return toast.error(`Insufficient balance.`);

    setLoading(true);
    try {
      const res = await fetch('/api/transaction/trade', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
            action: orderType, 
            asset: baseSymbol, 
            amount: numAmount, 
            price, 
            leverage, 
            marginType, 
            marketType: activeAsset?.type 
        })
      });
      if (!res.ok) throw new Error('Trade Failed');
      toast.success(`${orderType} Order Filled!`, {
        duration: 5000,
        icon: orderType === 'BUY' ? '🚀' : '💰',
        style: { background: orderType === 'BUY' ? '#059669' : '#dc2626', color: '#fff', fontWeight: 'bold' }
      });
      setAmount('');
      fetchBalance(); 
    } catch (err: any) { 
      toast.error(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen lg:h-[calc(100vh-80px)] p-2 md:p-4 flex flex-col lg:flex-row gap-4 text-white bg-[#0b1220] overflow-y-auto lg:overflow-hidden">
      <Toaster position="top-center" />

      {/* LEFT COLUMN: CHART & HEADER */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        
        {/* Header with Mobile-Optimized Dropdown */}
        <div className="bg-[#1a1f2e] border border-white/10 p-4 rounded-xl flex items-center justify-between relative z-50">
          <div className="flex items-center gap-4 w-full md:w-auto" ref={dropdownRef}>
            <div className="relative w-full md:w-auto">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex flex-col items-start hover:bg-white/5 p-1 px-2 rounded-lg transition-colors w-full md:w-auto text-left"
              >
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  {asset} <ChevronDown size={20} className={`transition-transform text-blue-400 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </h2>
                <span className="text-[10px] text-blue-400/80 font-mono tracking-widest uppercase">{activeAsset?.type}</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 w-[88vw] md:w-80 bg-[#1a1f2e] border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                  <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#0b1220]">
                    <Search size={18} className="text-gray-500" />
                    <input 
                      placeholder="Search assets..." 
                      className="bg-transparent text-base md:text-sm outline-none w-full text-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-[50vh] md:max-h-80 overflow-y-auto overscroll-contain">
                    {filteredAssets.map((a) => (
                      <button 
                        key={a.symbol} 
                        onClick={() => { setAsset(a.symbol); setIsDropdownOpen(false); setSearchQuery(''); }}
                        className="w-full p-4 md:p-3 hover:bg-white/10 flex justify-between items-center transition-colors border-b border-white/5"
                      >
                        <div className="text-left">
                          <p className="font-bold text-base md:text-sm">{a.symbol}</p>
                          <p className="text-xs md:text-[10px] text-gray-500">{a.name}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${a.type === 'CRYPTO' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {a.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="h-8 w-px bg-white/10 hidden md:block"></div>
            <div className="text-2xl md:text-3xl font-mono font-bold text-white ml-auto md:ml-0">
              {price !== null ? priceFormatter.format(price) : '---'}
            </div>
          </div>
        </div>

        {/* TradingView Chart */}
        <div className="h-[450px] lg:flex-1 bg-[#1a1f2e] border border-white/10 rounded-xl overflow-hidden relative shadow-2xl">
          <iframe
            src={`https://s.tradingview.com/widgetembed/?symbol=${asset}&interval=15&theme=dark&style=1&locale=en`}
            className="w-full h-full border-0 absolute inset-0"
            allowTransparency={true}
          ></iframe>
        </div>
      </div>

      {/* RIGHT COLUMN: ORDER PANEL */}
      <div className="w-full lg:w-[350px] flex flex-col gap-4 pb-10 lg:pb-0">
        
        <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-5 shadow-xl">
          {/* Buy/Sell Toggles */}
          <div className="flex bg-[#0b1220] p-1 rounded-lg mb-4">
            <button onClick={() => setOrderType('BUY')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${orderType === 'BUY' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400'}`}>BUY</button>
            <button onClick={() => setOrderType('SELL')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${orderType === 'SELL' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400'}`}>SELL</button>
          </div>

          {/* Leverage Selector */}
          <div className="mb-4">
            <div className="flex justify-between text-[10px] mb-2 uppercase tracking-tighter">
              <span className="text-gray-500">Leverage & Margin</span>
              <button onClick={() => setMarginType(marginType === 'ISOLATED' ? 'CROSS' : 'ISOLATED')} className="text-blue-400 font-bold">{marginType}</button>
            </div>
            <div className="flex items-center gap-2">
               <div className="flex-1 bg-[#0b1220] border border-white/10 rounded-lg p-2 flex items-center">
                  <input type="number" value={leverage} onChange={(e) => setLeverage(Math.min(100, Math.max(1, Number(e.target.value))))} className="bg-transparent w-full text-white font-mono outline-none text-sm"/>
                  <span className="text-gray-500 text-xs">x</span>
               </div>
               <div className="flex gap-1">
                  {[2, 10, 50, 100].map((lev) => (
                    <button key={lev} onClick={() => setLeverage(lev)} className={`px-2 py-2 rounded text-[10px] border ${leverage === lev ? 'bg-blue-600 border-blue-500' : 'bg-[#0b1220] border-white/5 text-gray-400'}`}>{lev}x</button>
                  ))}
               </div>
            </div>
          </div>

          {/* Balance & Amount Input */}
          <div className="flex justify-between text-xs mb-2 text-gray-400">
            <span className="flex items-center gap-1"><Wallet size={12}/> Balance</span>
            <span className="text-white font-mono">${balance.toLocaleString()}</span>
          </div>

          <div className="bg-[#0b1220] border border-white/10 rounded-lg p-3 mb-3 flex items-center justify-between">
            <span className="text-gray-500 text-sm font-medium">Margin</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-transparent text-right text-white font-mono outline-none w-24" placeholder="0.00"/>
            <span className="text-gray-400 text-xs ml-2">USD</span>
          </div>

          {/* Percentage Buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[0.25, 0.50, 0.75, 1].map((pct) => (
              <button key={pct} onClick={() => setPercentage(pct)} className="bg-[#0b1220] hover:bg-white/10 text-gray-400 text-[10px] py-2 rounded border border-white/5 font-mono">
                {pct * 100}%
              </button>
            ))}
          </div>

          {/* Position Info */}
          {amount && (
            <div className="bg-black/20 rounded-lg p-3 mb-4 space-y-1 border border-white/5 text-[11px]">
              <div className="flex justify-between text-gray-500"><span>Position Size</span><span className="text-white font-mono">${positionSize.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-500"><span>Required Margin</span><span className="text-white font-mono">${requiredMargin.toLocaleString()}</span></div>
            </div>
          )}

          {/* Execution Button */}
          <button onClick={handleTrade} disabled={loading || price === null} className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 ${orderType === 'BUY' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}>
            {loading ? <Loader2 className="animate-spin mx-auto"/> : `${orderType} ${baseSymbol} ${leverage}x`}
          </button>
        </div>

        {/* ORDER BOOK SECTION */}
        <div className="bg-[#1a1f2e] border border-white/10 rounded-xl p-4 flex-1 shadow-xl flex flex-col min-h-[300px]">
          <h3 className="text-[10px] font-bold text-gray-500 mb-3 flex justify-between uppercase tracking-widest"><span>Price (USD)</span><span>Amount ({baseSymbol})</span></h3>
          <div className="flex-1 flex flex-col justify-end gap-1 mb-2">
            {asks.slice(0, 5).map((ask, i) => (
              <div key={i} className="flex justify-between text-[11px] font-mono relative">
                <span className="text-red-400 z-10">{ask.price}</span><span className="text-gray-300 z-10">{ask.amount}</span>
                <div className="absolute right-0 h-full bg-red-500/10" style={{ width: `${Math.random() * 80}%` }}></div>
              </div>
            ))}
          </div>
          <div className="text-center py-2 text-md font-mono font-bold border-y border-white/5 text-white">
            {price !== null ? price.toFixed(2) : '---'} <ArrowUp size={14} className="inline text-green-500 ml-1"/>
          </div>
          <div className="flex-1 flex flex-col justify-start gap-1 mt-2">
            {bids.slice(0, 5).map((bid, i) => (
              <div key={i} className="flex justify-between text-[11px] font-mono relative">
                <span className="text-green-400 z-10">{bid.price}</span><span className="text-gray-300 z-10">{bid.amount}</span>
                <div className="absolute right-0 h-full bg-green-500/10" style={{ width: `${Math.random() * 80}%` }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
