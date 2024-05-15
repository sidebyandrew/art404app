import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { cookieStorage, createStorage } from "wagmi";
import { defineChain } from "viem";
import { appName404, PROD_BASE_URL, projectId404 } from "@/constant/config404";

export const projectId = projectId404;
if (!projectId) throw new Error("Project ID is not defined");

export const metadata = {
  name: appName404,
  description: "ART 404",
  url: PROD_BASE_URL,
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const artela = /*#__PURE__*/ defineChain({
  id: 11822,
  name: "Artela Testnet",
  network: "artela-testnet",
  iconUrl:
    "https://framerusercontent.com/images/xLv7JZ8nzPaZ9zk7j63YbRZHqY.png",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "Artela",
    symbol: "ART",
  },
  rpcUrls: {
    public: {
      http: [
        "https://betanet-rpc1.artela.network",
        "https://betanet-rpc2.artela.network",
      ],
    },
    default: {
      http: [
        "https://betanet-rpc1.artela.network",
        "https://betanet-rpc2.artela.network",
      ],
    },
  },
  blockExplorers: {
    default: { name: "SnowTrace", url: "https://betanet-scan.artela.network/" },
    etherscan: {
      name: "SnowTrace",
      url: "https://betanet-scan.artela.network/",
    },
  },
  testnet: false,
});

// Create wagmiConfig
const chains = [artela] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});
