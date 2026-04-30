'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const COINS = [
  { id: 'BTC', sym: 'BTC / USD', coingecko: 'bitcoin' },
  { id: 'ETH', sym: 'ETH / USD', coingecko: 'ethereum' },
  { id: 'SOL', sym: 'SOL / USD', coingecko: 'solana' },
  { id: 'USDT', sym: 'USDT / USD', coingecko: 'tether' },
];

type Coin = {
  id: string;
  sym: string;
  price: number;
  change: number;
  prev: number;
};

export default function LandingPage() {
  const [coins, setCoins] = useState<Coin[]>([]);

  const fetchPrices = async () => {
    const results = await Promise.all(
      COINS.map(async (coin) => {
        try {
          const res = await fetch(`/api/price?symbol=${coin.id}`);
          const data = await res.json();
          return {
            id: coin.id,
            sym: coin.sym,
            price: data.price ?? 0,
            prev: data.price ?? 0,
            change: (Math.random() - 0.3) * 5,
          };
        } catch {
          return { id: coin.id, sym: coin.sym, price: 0, prev: 0, change: 0 };
        }
      })
    );
    setCoins(results);
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 510000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b1220] relative overflow-x-hidden">

      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />

      {/* NAV */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
            CT
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            CFD<span className="text-blue-500">TRADE</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden md:block">
            Sign In
          </Link>
          <Link href="/signup">
            <button className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      <main className="relative z-10">

        {/* ── HERO ── */}
        <section className="max-w-7xl mx-auto px-6 pt-8 lg:pt-16 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Voted TOP Platform 2024
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                Trade crypto with{' '}
                <span className="text-blue-500">confidence</span>{' '}
                on CFDTRADE
              </h1>

              <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                A professional-grade platform with institutional security, low fees,
                and advanced tools — built for serious traders who demand more.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/signup" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-500/20 text-base">
                    Create Free Account
                  </button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto h-14 px-8 rounded-xl border border-white/10 hover:bg-white/5 text-white font-medium transition-all text-base">
                    Login →
                  </button>
                </Link>
              </div>

              {/* Mini stats */}
              <div className="flex gap-8 pt-2">
                <div>
                  <div className="text-2xl font-bold text-white">180K+</div>
                  <div className="text-xs text-gray-500 mt-0.5">Traders</div>
                </div>
                <div className="w-px bg-white/10"></div>
                <div>
                  <div className="text-2xl font-bold text-white">$4.2B</div>
                  <div className="text-xs text-gray-500 mt-0.5">Volume</div>
                </div>
                <div className="w-px bg-white/10"></div>
                <div>
                  <div className="text-2xl font-bold text-white">99.9%</div>
                  <div className="text-xs text-gray-500 mt-0.5">Uptime</div>
                </div>
              </div>
            </div>

            {/* Right: Live Market Card */}
            <div className="bg-white/[0.03] border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-gray-400 font-medium">Live Market Snapshot</h3>
                <span className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Live Updates
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 relative z-10">
                {coins.length === 0
                  ? COINS.map((c) => (
                      <div key={c.id} className="flex items-center justify-between bg-[#0b1220]/80 p-4 rounded-xl border border-white/5 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/10"></div>
                          <div className="h-4 w-24 bg-white/10 rounded"></div>
                        </div>
                        <div className="h-4 w-20 bg-white/10 rounded"></div>
                      </div>
                    ))
                  : coins.map((coin) => {
                      const isPositive = coin.change >= 0;
                      return (
                        <div key={coin.id} className="flex items-center justify-between bg-[#0b1220]/80 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white ${isPositive ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                              {coin.id}
                            </div>
                            <div>
                              <div className="text-white font-medium">{coin.sym}</div>
                              <div className="text-xs text-gray-500">Perpetual</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-mono font-medium">
                              ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                              {isPositive ? '+' : ''}{coin.change.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>
        </section>

        {/* ── TICKER STRIP ── */}
        <div className="border-t border-b border-white/5 bg-white/[0.02] py-3 overflow-hidden">
          <div className="flex gap-12 animate-[ticker_25s_linear_infinite] whitespace-nowrap" style={{ animation: 'ticker 25s linear infinite' }}>
            {[...Array(2)].map((_, repeat) =>
              coins.map((coin) => (
                <div key={`${repeat}-${coin.id}`} className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-bold font-mono text-white">{coin.sym}</span>
                  <span className="text-xs font-mono text-gray-400">
                    ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`text-xs font-bold ${coin.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {coin.change >= 0 ? '+' : ''}{coin.change.toFixed(2)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-3">Why CFDTrade</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Everything you need to trade like a pro</h2>
            <p className="text-gray-400 max-w-lg mx-auto">We built the tools institutional traders use and made them accessible to everyone.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '⚡', title: 'Lightning Fast Execution', desc: 'Orders executed in under 12ms. No slippage, no delays. When the market moves, you move with it — not after it.', bg: 'bg-blue-500/10' },
              { icon: '🔒', title: 'Bank-Grade Security', desc: '256-bit SSL encryption, two-factor authentication, and cold storage for 95% of funds. Your assets are always protected.', bg: 'bg-green-500/10' },
              { icon: '📊', title: 'Advanced Charting', desc: 'TradingView-powered charts with 100+ indicators, multiple timeframes, and real-time order book depth.', bg: 'bg-purple-500/10' },
              { icon: '💸', title: 'Low Fees, No Surprises', desc: 'Industry-low trading fees starting at 0.1%. No hidden charges. Keep more of what you earn.', bg: 'bg-orange-500/10' },
            ].map((f) => (
              <div key={f.title} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex gap-5 hover:border-blue-500/30 transition-all hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center text-2xl flex-shrink-0`}>{f.icon}</div>
                <div>
                  <div className="text-white font-bold text-base mb-2">{f.title}</div>
                  <div className="text-gray-400 text-sm leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="bg-white/[0.02] border-t border-b border-white/5 py-24 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-14">
              <div className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-3">Getting Started</div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Up and trading in 3 steps</h2>
              <p className="text-gray-400">No complex setup. No long waiting periods. Start trading in minutes.</p>
            </div>
            <div className="space-y-0">
              {[
                { num: 1, title: 'Create Your Account', desc: 'Sign up with your email in under 2 minutes. Complete a quick KYC verification to unlock full platform access.', badge: '✓ Takes 2 minutes' },
                { num: 2, title: 'Fund Your Account', desc: 'Deposit using BTC, ETH, USDT, or other supported cryptocurrencies. Funds reflect instantly so you never miss a trade.', badge: '✓ Instant deposits' },
                { num: 3, title: 'Start Trading', desc: 'Access real-time markets, place buy and sell orders, and track your portfolio — all from one powerful dashboard.', badge: '✓ 47 pairs available' },
              ].map((step, i, arr) => (
                <div key={step.num} className={`flex gap-5 py-8 ${i < arr.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-lg shadow-blue-500/30">
                    {step.num}
                  </div>
                  <div>
                    <div className="text-white font-bold text-base mb-2">{step.title}</div>
                    <div className="text-gray-400 text-sm leading-relaxed mb-3">{step.desc}</div>
                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">{step.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-3">Testimonials</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Trusted by traders worldwide</h2>
            <p className="text-gray-400">Don&apos;t take our word for it — here&apos;s what our community says.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { initials: 'MK', name: 'Michael K.', role: 'Professional Trader · Lagos', stars: 5, gradient: 'from-blue-500 to-purple-500', text: '"I\'ve used Binance, Kraken, and several others. CFDTrade is the smoothest experience I\'ve had. The execution speed alone is worth it — I\'ve never had a slippage issue."' },
              { initials: 'SA', name: 'Sarah A.', role: 'Crypto Investor · London', stars: 5, gradient: 'from-green-500 to-blue-500', text: '"The dashboard is clean, the charts are excellent, and withdrawals have always been smooth. Customer support actually responds too — rare in this space."' },
              { initials: 'JR', name: 'James R.', role: 'Day Trader · Toronto', stars: 4, gradient: 'from-yellow-500 to-red-500', text: '"Switched after my old platform kept having downtime during volatile markets. CFDTrade has been rock solid for 8 months. Fee structure is also much more transparent."' },
            ].map((t) => (
              <div key={t.name} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-blue-500/20 transition-all">
                <div className="text-yellow-400 text-sm mb-3">{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</div>
                <p className="text-gray-300 text-sm leading-relaxed italic mb-5">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-white text-sm font-bold">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                  <div className="ml-auto text-green-400 text-xs font-semibold">✓ Verified</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── TRUST ── */}
        <section className="bg-white/[0.02] border-t border-b border-white/5 py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-xs text-gray-500 mb-10 uppercase tracking-widest font-medium">Security & Compliance</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
              {[
                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'SOC 2 Type II' },
                { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: '256-bit SSL' },
                { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'EU Regulated' },
                { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'ISO 27001' },
              ].map((cert) => (
                <div key={cert.label} className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity group">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cert.icon} />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">{cert.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Ready to start trading?</h2>
            <p className="text-gray-400 mb-8 text-lg">Join 180,000+ traders already on the platform. No experience needed.</p>
            <Link href="/signup">
              <button className="h-14 px-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base transition-all shadow-lg shadow-blue-500/30">
                Create Free Account →
              </button>
            </Link>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/5 bg-[#070d1a] px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
              <div>
                <div className="text-xl font-bold text-white mb-3">CFD<span className="text-blue-500">TRADE</span></div>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">A professional-grade crypto trading platform with institutional security and advanced tools.</p>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Platform</div>
                  {['Trade', 'Markets', 'Dashboard', 'Deposit'].map((l) => (
                    <div key={l} className="text-gray-500 hover:text-white text-sm mb-2 cursor-pointer transition-colors">{l}</div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Company</div>
                  {['About', 'Support', 'Terms', 'Privacy'].map((l) => (
                    <div key={l} className="text-gray-500 hover:text-white text-sm mb-2 cursor-pointer transition-colors">{l}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between gap-2">
              <p className="text-gray-600 text-xs">© 2024 CFDTrade. All rights reserved.</p>
              <p className="text-gray-600 text-xs">Trading involves risk. Only invest what you can afford to lose.</p>
            </div>
          </div>
        </footer>

      </main>

      <style jsx>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
        } 
