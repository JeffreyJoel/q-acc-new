import { NextRequest } from 'next/server';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const days = searchParams.get('days') || '7';

    if (!address) {
      return Response.json({ error: 'Missing address param' }, { status: 400 });
    }

    const url = `${COINGECKO_API}/coins/polygon-pos/contract/${address}/market_chart?vs_currency=usd&days=${days}`;

    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) {
      return Response.json(
        { error: 'Upstream error', status: res.status },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
