'use client'; 

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Real Market Data (Snapshot)
const INITIAL_COINS = [
  { id: 'btc', sym: 'BTC / USD', price: 78710.27, change: 1.93 },
  { id: 'eth', sym: 'ETH / USD', price: 2341.12, change: 2.72 },
  { id: 'sol', sym: 'SOL / USD', price: 130.45, change: 3.50 },
  { id: 'xrp', sym: 'XRP / USD', price: 1.61, change: 2.10 },
];

export default function LandingPage() {
  const [coins, setCoins] = useState(INITIAL_COINS);

  // The "Heartbeat" Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(currentCoins => 
        currentCoins.map(coin => {
          const move = (Math.random() - 0.5) * 0.2; 
          const newPrice = coin.price * (1 + move / 100);
          const newChange = coin.change + move;

          return {
            ...coin,
            price: newPrice,
            change: newChange
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b1220] relative overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* ✅ NEW: Navbar / Logo Section */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
            {/* Optional Icon */}
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
                CT
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
                CFD<span className="text-blue-500">TRADE</span>
            </span>
        </div>

        {/* Optional: Top right shortcut */}
        <div className="hidden md:block">
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Sign In &rarr;
            </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-8 lg:pt-16 pb-12 w-full relative z-10">
        
        {/* HERO SECTION */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          
          {/* Left Side: Hero Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Voted TOP Platform 2024
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
              Trade crypto with <br className="hidden lg:block" />
              <span className="text-blue-500">confidence</span> on CMXTRADE
            </h1>
            
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
              A professional-grade platform with institutional security, low fees, 
              and advanced tools—built for serious traders.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/20">
                  Create Account
                </button>
              </Link>
              
              <Link href="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-14 px-8 rounded-xl border border-white/10 hover:bg-white/5 text-white font-medium transition-all">
                  Login
                </button>
              </Link>
            </div>
          </div>

          {/* Right Side: LIVE Market Card */}
          <div className="bg-white/[0.03] border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-sm mt-8 lg:mt-0 relative overflow-hidden">
            {/* Glass reflection effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-gray-400 font-medium">Live Market Snapshot</h3>
              <span className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-green-400"></span> Live Updates
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 relative z-10">
              {coins.map((coin) => {
                const isPositive = coin.change >= 0;
                const colorClass = isPositive ? 'text-green-400' : 'text-red-400';
                const bgClass = isPositive ? 'bg-green-500/10' : 'bg-red-500/10';
                const iconBg = isPositive ? 'bg-green-500/20' : 'bg-red-500/20';

                return (
                  <div key={coin.id} className="flex items-center justify-between bg-[#0b1220]/80 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all duration-500 group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg} text-xs font-bold text-white transition-colors duration-500 group-hover:scale-110`}>
                        {coin.sym.substring(0, 3)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{coin.sym}</div>
                        <div className="text-xs text-gray-500">Perpetual</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-mono font-medium transition-all duration-300">
                        ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs ${colorClass} transition-colors duration-500 font-medium`}>
                        {isPositive ? '+' : ''}{coin.change.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CERTIFICATIONS SECTION */}
        <section className="border-t border-white/5 pt-12">
          <p className="text-center text-sm text-gray-500 mb-8 uppercase tracking-widest font-medium">
            Trusted  Globally
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
            {/* Cert 1 */}
            <div className="flex flex-col items-center gap-2 group hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-400">SOC 2 Type II</span>
            </div>

            {/* Cert 2 */}
            <div className="flex flex-col items-center gap-2 group hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-green-500/50 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-400">256-bit SSL</span>
            </div>

            {/* Cert 3 */}
            <div className="flex flex-col items-center gap-2 group hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-purple-500/50 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-400">EU Regulated</span>
            </div>

            {/* Cert 4 */}
            <div className="flex flex-col items-center gap-2 group hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-yellow-500/50 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-400">ISO 27001</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
