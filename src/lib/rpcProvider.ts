import { ethers } from 'ethers';

import config from '@/config/configuration';

// Multiple RPC providers for redundancy and rate limit handling
export const polygonRpcUrls = [
  // Primary: Use environment variable if provided
  ...(config.NETWORK_RPC_ADDRESS ? [config.NETWORK_RPC_ADDRESS] : []),
  // Fallback public RPCs with higher rate limits
  'https://polygon-rpc.com',
  'https://rpc.ankr.com/polygon',
  'https://polygon.llamarpc.com',
  'https://polygon.blockpi.network/v1/rpc/public',
  'https://polygon.drpc.org',
  'https://rpc-mainnet.matic.quiknode.pro',
];

// Rate limiting and error tracking
const rpcStats = {
  currentIndex: 0,
  failedProviders: new Set<number>(),
  lastResetTime: Date.now(),
  requestCounts: new Map<string, number>(),
  maxRequestsPerMinute: 50, // Conservative limit
};

// Reset failed providers every 5 minutes
const RESET_INTERVAL = 5 * 60 * 1000;

function resetFailedProviders() {
  const now = Date.now();
  if (now - rpcStats.lastResetTime > RESET_INTERVAL) {
    rpcStats.failedProviders.clear();
    rpcStats.requestCounts.clear();
    rpcStats.lastResetTime = now;
  }
}

function getNextProvider(): ethers.JsonRpcProvider {
  resetFailedProviders();

  // Find next available provider
  for (let i = 0; i < polygonRpcUrls.length; i++) {
    const index = (rpcStats.currentIndex + i) % polygonRpcUrls.length;

    if (!rpcStats.failedProviders.has(index)) {
      const url = polygonRpcUrls[index];
      const requestCount = rpcStats.requestCounts.get(url) || 0;

      // Check rate limits
      if (requestCount < rpcStats.maxRequestsPerMinute) {
        rpcStats.currentIndex = index;
        rpcStats.requestCounts.set(url, requestCount + 1);

        return new ethers.JsonRpcProvider(url, {
          name: 'polygon',
          chainId: 137,
        });
      }
    }
  }

  // If all providers are rate limited, use the first one anyway
  console.warn('All RPC providers are rate limited, using fallback');
  return new ethers.JsonRpcProvider(polygonRpcUrls[0], {
    name: 'polygon',
    chainId: 137,
  });
}

function markProviderAsFailed(url: string) {
  const index = polygonRpcUrls.indexOf(url);
  if (index !== -1) {
    rpcStats.failedProviders.add(index);
    console.warn(`Marking RPC provider as failed: ${url}`);
  }
}

// Enhanced provider with retry logic
export class EnhancedJsonRpcProvider {
  private currentProvider: ethers.JsonRpcProvider;
  private currentUrl: string;

  constructor() {
    this.currentProvider = getNextProvider();
    this.currentUrl = polygonRpcUrls[rpcStats.currentIndex];
  }

  async call(params: any, retries = 3): Promise<any> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const result = await this.currentProvider.call(params);
        return result;
      } catch (error: any) {
        console.error(`RPC call failed (attempt ${attempt + 1}):`, error);

        // Check if it's a rate limit error
        if (
          error?.message?.includes('Too Many Requests') ||
          error?.message?.includes('rate limit') ||
          error?.message?.includes('429') ||
          error?.code === 'BAD_DATA'
        ) {
          // Mark current provider as failed and get a new one
          markProviderAsFailed(this.currentUrl);

          this.currentProvider = getNextProvider();
          this.currentUrl = polygonRpcUrls[rpcStats.currentIndex];

          // Wait before retry with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));

          continue;
        }

        // For non-rate-limit errors, don't retry
        throw error;
      }
    }

    throw new Error(`Failed to execute RPC call after ${retries} attempts`);
  }

  async getBalance(params: any): Promise<bigint> {
    return this.currentProvider.getBalance(params);
  }

  async getBlockNumber(): Promise<number> {
    return this.currentProvider.getBlockNumber();
  }

  async waitForTransaction(hash: string): Promise<any> {
    return this.currentProvider.waitForTransaction(hash);
  }

  // Proxy other methods as needed
  getNetwork() {
    return this.currentProvider.getNetwork();
  }
}

// Singleton instance
let providerInstance: EnhancedJsonRpcProvider | null = null;

export function getEnhancedProvider(): EnhancedJsonRpcProvider {
  if (!providerInstance) {
    providerInstance = new EnhancedJsonRpcProvider();
  }
  return providerInstance;
}

// For backward compatibility with existing code
export function createReliableProvider(): ethers.JsonRpcProvider {
  return getNextProvider();
}

// Reset provider instance (useful for testing or manual recovery)
export function resetProvider(): void {
  providerInstance = null;
  rpcStats.currentIndex = 0;
  rpcStats.failedProviders.clear();
  rpcStats.requestCounts.clear();
}
