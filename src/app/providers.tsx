"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import {
  connectorsForWallets,
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import {createConfig, http, WagmiProvider} from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProviderProps } from "next-themes/dist/types";
import { artela } from "@/config";
import { appName404, projectId404 } from "@/constant/config404";
import {
  coinbaseWallet,
  metaMaskWallet,
  okxWallet,
  rainbowWallet,
  walletConnectWallet
} from "@rainbow-me/rainbowkit/wallets";
import {metaMask, walletConnect} from "@wagmi/connectors";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}


const connectors = connectorsForWallets(
  [
    {
      groupName: "Best compatibility",
      wallets: [okxWallet,  coinbaseWallet, walletConnectWallet, metaMaskWallet],
    },
  ],
  {
    projectId:projectId404,
    appName:appName404,
  },
);

function coinbaseWalletConnectors(param: { appName: string }) {
  return undefined;
}

const config = createConfig({
  connectors: [
    ...connectors,
    walletConnect({
      projectId:projectId404,
    }),
  ],
  chains: [artela],
  transports: {
    [artela.id]: http(),
  },
  multiInjectedProviderDiscovery: false,
  ssr: true,
});
//
// const config = getDefaultConfig({
//   appName: appName404,
//   projectId: projectId404,
//   chains: [artela],
//   ssr: true,
// });

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
