import { Chain, chain, configureChains, createClient } from "wagmi";

import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { isDev } from "./utils";
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

export const { chains, provider } = configureChains(
  [isDev ? ganacheChain : chain.goerli],
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
