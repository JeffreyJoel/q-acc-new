"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import {
  cookieStorage,
  createStorage,
  http,
} from "wagmi";

import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { polygon } from "viem/chains";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import config from "@/config/configuration";

const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
    showWalletUIs: true,
    priceDisplay: {
      primary: "fiat-currency",
      secondary: "native-token",
    },
  },
  loginMethods: ["wallet", "email", "google", "twitter"],
  appearance: {
    showWalletLoginFirst: false,
    theme: "dark",
    logo: "/images/logos/logo-light.png",
    accentColor: "#FBBA80",
  },
  defaultChain: polygon,
  supportedChains: config.SUPPORTED_CHAINS,
  
};

const transports = Object.fromEntries(
  config.SUPPORTED_CHAINS.map((chain) => [chain.id, http()])
)

export const wagmiConfig = createConfig({
  chains: config.SUPPORTED_CHAINS,
  // connectors: [injected()],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports,
});

export default function Providers(props: {
  children: ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {props.children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
