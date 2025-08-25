"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import {
  cookieStorage,
  createStorage,
  http,
} from "wagmi";

import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { polygon, polygonAmoy, mainnet, base } from "viem/chains";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";

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
  supportedChains: [polygon, mainnet, base, polygonAmoy],
  
};

export const config = createConfig({
  chains: [polygon, polygonAmoy],
  // connectors: [injected()],
  // storage: createStorage({
  //   storage: cookieStorage,
  // }),
  ssr: false,
  transports: {
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
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
        <WagmiProvider config={config}>
          {props.children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
