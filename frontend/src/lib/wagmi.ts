import { Chain, configureChains, createClient, goerli, mainnet } from "wagmi";
import { devNetwork, isDev } from "./utils";

import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { publicProvider } from "wagmi/providers/public";

export const ganacheChain: Chain = {
  id: 1337,
  name: "Ganache",
  network: "ganache",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["HTTP://127.0.0.1:8545"] },
  },
  testnet: true,
};

export const currentChain =
  isDev && devNetwork === "ganache"
    ? ganacheChain
    : isDev && devNetwork === "goerli"
    ? goerli
    : mainnet;

export const { chains, provider } = configureChains(
  [currentChain],
  [publicProvider()]
);

export const { connectors } = getDefaultWallets({
  appName: "Nft Marketplace",
  chains,
});

export const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});
