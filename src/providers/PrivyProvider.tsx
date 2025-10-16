'use client';

import { type ReactNode, useState } from 'react';

import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { polygon } from 'viem/chains';
import {
  cookieStorage,
  createStorage,
  http,
  cookieToInitialState,
} from 'wagmi';

import config from '@/config/configuration';
import { ChainProvider } from '@/contexts/chainManager.context';
import { ZeroDevProvider } from '@/contexts/ZeroDevContext';

const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    showWalletUIs: true,
    priceDisplay: {
      primary: 'fiat-currency',
      secondary: 'native-token',
    },
  },
  loginMethods: ['wallet', 'email', 'google', 'twitter'],
  appearance: {
    showWalletLoginFirst: false,
    theme: 'dark',
    logo: '/images/logos/logo-light.png',
    accentColor: '#FBBA80',
  },
  defaultChain: polygon,
  supportedChains: config.SUPPORTED_CHAINS,
};

const transports = Object.fromEntries(
 config.SUPPORTED_CHAINS.map(chain => [
    chain.id,
    chain.id === polygon.id
      ? http('https://polygon-rpc.com')
      : http()
  ])
);

export const wagmiConfig = createConfig({
  chains: config.SUPPORTED_CHAINS,
  // connectors: [injected()],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports,
});

export default function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Get initial state from cookies with Polygon as default fallback
  const initialState = cookieToInitialState(wagmiConfig, undefined);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig} initialState={initialState}>
          <ChainProvider>
            {/* <ZeroDevProvider> */}
              {props.children}
              {/* </ZeroDevProvider> */}
          </ChainProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
