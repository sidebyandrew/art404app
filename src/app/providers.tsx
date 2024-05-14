"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProviderProps } from "next-themes/dist/types";
import { sepolia } from "wagmi/chains";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

//
//
//
//
//
// const projectId = "bb84875c82bab72719dba296deb14d33";
// const appName = "art404app";
//
// const connectors = connectorsForWallets(
//   [
//     {
//       groupName: "Best compatibility",
//       wallets: [walletConnectWallet, coinbaseWallet, rainbowWallet],
//     },
//   ],
//   {
//     projectId,
//     appName,
//   },
// );
//
// const config = createConfig({
//   connectors: [
//     ...connectors,
//     coinbaseWalletConnectors({
//       appName,
//     }),
//     walletConnect({
//       projectId,
//     }),
//   ],
//   chains: [mainnet],
//   transports: {
//     [mainnet.id]: http(),
//   },
//   multiInjectedProviderDiscovery: false,
//   ssr: true,
// });

const config = getDefaultConfig({
  appName: "art404app",
  projectId: "bb84875c82bab72719dba296deb14d33",
  // chains: [sepolia, mainnet, polygon, base],
  chains: [sepolia],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <div>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({ ...darkTheme.accentColors.red })}
          >
            <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}
