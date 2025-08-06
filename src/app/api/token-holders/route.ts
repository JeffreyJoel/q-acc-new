import { NextRequest } from "next/server";

const BLOCKSCOUT_BASE_URL =
  "https://polygon.blockscout.com/api/v2/tokens";
const TOP_HOLDERS_LIMIT = 20;

/**
 * Helper that performs a GET request and parses the JSON response.
 */
async function fetchJson<T = any>(url: string): Promise<T> {
  const res = await fetch(url, {
    // Blockscout rate-limits aggressively, so we disable cache to always
    // hit the network and get the freshest data.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Blockscout request failed (status ${res.status}): ${url}`
    );
  }

  return res.json();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenAddress = searchParams.get("tokenAddress");

    // Validate token address
    if (!tokenAddress || tokenAddress === "0" || tokenAddress === "") {
      return Response.json(
        { error: "Invalid token address", success: false },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------------------
    // 1. Fetch token metadata to get totalSupply & decimals
    // ---------------------------------------------------------------------
    const tokenInfoUrl = `${BLOCKSCOUT_BASE_URL}/${tokenAddress}`;
    const tokenInfo: any = await fetchJson(tokenInfoUrl);

    // Fallback defaults if Blockscout is missing some fields
    const decimals = Number(tokenInfo.decimals ?? 18);
    const totalSupplyRaw = tokenInfo.total_supply ?? tokenInfo.totalSupply ?? "0";

    const totalSupply = Number(totalSupplyRaw) / 10 ** decimals;

    // ---------------------------------------------------------------------
    // 2. Fetch counters to obtain holders count
    // ---------------------------------------------------------------------
    const countersUrl = `${BLOCKSCOUT_BASE_URL}/${tokenAddress}/counters`;
    const counters: any = await fetchJson(countersUrl);
    const totalHoldersCount = Number(
      counters.token_holders_count ?? tokenInfo.holders_count ?? 0
    );

    // ---------------------------------------------------------------------
    // 3. Fetch the holder list (limited to TOP_HOLDERS_LIMIT)
    // ---------------------------------------------------------------------
    const holdersUrl = `${BLOCKSCOUT_BASE_URL}/${tokenAddress}/holders?page=1&offset=${TOP_HOLDERS_LIMIT}`;
    const holdersResponse: any = await fetchJson(holdersUrl);
  
    const holders = Array.isArray(holdersResponse)
      ? holdersResponse
      : holdersResponse.items ?? [];

    // ---------------------------------------------------------------------
    // 4. Shape response: address + percentage (with four-decimal precision)
    // ---------------------------------------------------------------------
    const shapedHolders = holders.slice(0, TOP_HOLDERS_LIMIT).map((h: any) => {
      const rawBalance = h.balance ?? h.value ?? "0";
      const balance = Number(rawBalance) / 10 ** decimals;
      const percentage = totalSupply > 0 ? (balance / totalSupply) * 100 : 0;

      return {
        address: h.address.hash ?? "",
        percentage: Number(percentage.toFixed(4)),
      };
    });

    return Response.json({
      success: true,
      totalHolders: totalHoldersCount,
      holders: shapedHolders,
    });
  } catch (error) {
    console.error("Error fetching token holders:", error);
    return Response.json(
      { error: "Failed to fetch token holders", success: false },
      { status: 500 }
    );
  }
}