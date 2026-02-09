import { NextResponse } from 'next/server';

type CachedPrice = {
  price: number;
  updatedAt: string;
  fetchedAt: number;
};

const CACHE_TTL_MS = 510 * 1000;
const priceCache = new Map<string, CachedPrice>();

const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'tether',
  SOL: 'solana',
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawSymbol = (searchParams.get('symbol') || 'BTC').toUpperCase().replace(/[^A-Z]/g, '');
  const symbol = SYMBOL_TO_COINGECKO_ID[rawSymbol] ? rawSymbol : 'BTC';
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
    const id = SYMBOL_TO_COINGECKO_ID[symbol];
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
      { next: { revalidate: 510 } },
    );

    if (!res.ok) throw new Error('Fetch failed');

    const data = await res.json();
    const price = Number(data?.[id]?.usd);
    if (!Number.isFinite(price)) throw new Error('Invalid price response');

    const updatedAt = new Date().toISOString();
    priceCache.set(cacheKey, { price, updatedAt, fetchedAt: now });

    return NextResponse.json({
      symbol,
      price,
      currency: 'USD',
      updatedAt,
    });
  } catch (error) {
    console.error('Price fetch error:', error);

    if (cached) {
      return NextResponse.json({
        symbol,
        price: cached.price,
        currency: 'USD',
        updatedAt: cached.updatedAt,
      });
    }

    return NextResponse.json(
      { error: 'Price unavailable', symbol, currency: 'USD' },
      { status: 502 },
    );
  }
}
