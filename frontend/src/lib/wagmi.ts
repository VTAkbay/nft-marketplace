import { Chain, chain, configureChains, createClient } from "wagmi";
import { devNetwork, isDev } from "./utils";

import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
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
    default: "HTTP://127.0.0.1:8545",
  },
  testnet: true,
};

export const currentChain =
  isDev && devNetwork === "ganache"
    ? ganacheChain
    : isDev && devNetwork === "goerli"
    ? chain.goerli
    : isDev && devNetwork === "sepolia"
    ? chain.sepolia
    : chain.mainnet;

export const { chains, provider } = configureChains(
  [currentChain],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== ganacheChain.id) return null;
        return { http: chain.rpcUrls.default };
      },
    }),
    publicProvider(),
  ]
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
