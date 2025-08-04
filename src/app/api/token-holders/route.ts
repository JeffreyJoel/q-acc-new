import { NextRequest } from "next/server";
import Moralis from "moralis";

// Singleton pattern to ensure Moralis is only started once
let isMoralisStarted = false;

async function ensureMoralisStarted() {
  if (!isMoralisStarted) {
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY as string,
    });
    isMoralisStarted = true;
  }
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

    // Ensure Moralis is started only once
    await ensureMoralisStarted();

    // Get token holders using Moralis SDK
    const response = await Moralis.EvmApi.token.getTokenOwners({
      chain: "0x89", // Ethereum chain
      tokenAddress: tokenAddress as string,
    });     

    return Response.json(response.result);
  } catch (error) {
    console.error("Error fetching token holders:", error);
    return Response.json(
      { error: "Failed to fetch token holders", success: false },
      { status: 500 }
    );
  }
}