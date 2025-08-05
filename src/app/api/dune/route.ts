import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const DUNE_API_KEY = process.env.DUNE_API_KEY;
    
    const endpoints = [
      'https://api.dune.com/api/v1/query/4941283/results',
      'https://api.dune.com/api/v1/query/4926497/results',
    //   'https://api.dune.com/api/v1/query/4926497/results'
    ];
  
    try {
      // Execute all requests in parallel
      const promises = endpoints.map(endpoint =>
        fetch(endpoint, {
          headers: {
            'X-Dune-API-Key': DUNE_API_KEY || '',
          },
        }).then(res => res.json())
      );
  
      const results = await Promise.all(promises);
      
      // Extract relevant data from the Dune results and format the response
      const formattedResponse = {
        amount_in_protocol_pol: results[0]?.result?.rows?.[0]?.pol_protocol ?? null,
        total_raised_pol: results[0]?.result?.rows?.[0]?.pol_from_grants ?? null,
        total_market_cap: results[1]?.result?.rows?.[0]?._col0 ?? null,
      };

      return NextResponse.json(formattedResponse);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
  }
  