import { Address } from 'viem';

export function shortenAddress(
  address: Address | string | null | undefined,
): string {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
}

export function shortenAddressLarger(
  address: Address | string | null | undefined,
): string {
  return address ? `${address.slice(0, 8)}...${address.slice(-8)}` : "";
}