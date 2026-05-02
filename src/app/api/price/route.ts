    import { NextResponse } from 'next/server';

type CachedPrice = {
  price: number;
  updatedAt: string;
  fetchedAt: number;
};

const CACHE_TTL_MS = 30 * 1000; // Reduced to 30s for better accuracy
const priceCache = new Map<string, CachedPrice>();

const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  SOL: 'solana',
};

// List of symbols you consider "Stocks"
const STOCK_SYMBOLS = ['AAPL', 'TSLA', 'NVDA', 'AMZN', 'MSFT'];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawSymbol = (searchParams.get('symbol') || 'BTC').toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  const isStock = STOCK_SYMBOLS.includes(rawSymbol);
  const symbol = isStock ? rawSymbol : (SYMBOL_TO_COINGECKO_ID[rawSymbol] ? rawSymbol : 'BTC');
  const cacheKey = `${symbol}-USD`;

  const cached = priceCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({
      symbol,
      price: cached.price,
      currency: 'USD',
      updatedAt: cached.updatedAt,
    });
  }

  try {
    let price = 0;

    if (isStock) {
      // Fetch Stock Price from Yahoo Finance Query API
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
      if (!res.ok) throw new Error('Stock fetch failed');
      const data = await res.json();
      price = data.chart.result[0].meta.regularMarketPrice;
    } else {
      // Fetch Crypto Price from CoinGecko
      const id = SYMBOL_TO_COINGECKO_ID[symbol];
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
      );
      if (!res.ok) throw new Error('Crypto fetch failed');
      const data = await res.json();
      price = Number(data?.[id]?.usd);
    }

    if (!Number.isFinite(price)) throw new Error('Invalid price response');

    const updatedAt = new Date().toISOString();
    priceCache.set(cacheKey, { price, updatedAt, fetchedAt: now });

    return NextResponse.json({ symbol, price, currency: 'USD', updatedAt });
  } catch (error) {
    console.error('Price fetch error:', error);
    if (cached) return NextResponse.json({ symbol, price: cached.price, currency: 'USD', updatedAt: cached.updatedAt });
    return NextResponse.json({ error: 'Price unavailable', symbol }, { status: 502 });
  }
}
