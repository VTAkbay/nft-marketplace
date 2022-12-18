import "@rainbow-me/rainbowkit/styles.css";
import "./App.css";

import { HashRouter, Route, Routes } from "react-router-dom";
import { chains, currentChain } from "./lib/wagmi";
import { useNetwork, useSwitchNetwork } from "wagmi";

import Header from "./components/Header";
import Home from "./pages/Home";
import Market from "./pages/Market";
import MyNfts from "./pages/MyNfts";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import React from "react";

function App() {
  const [marketplaceAddress, setMarketplaceAddress] = React.useState("");
  const { chain: useNetworkChain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  React.useLayoutEffect(() => {
    if (currentChain.name !== useNetworkChain?.name) {
      switchNetwork?.(currentChain.id);
    }
  }, [useNetworkChain, switchNetwork]);

  return (
    <HashRouter>
      <RainbowKitProvider
        coolMode
        chains={chains}
        initialChain={currentChain}
        showRecentTransactions={true}
      >
        {marketplaceAddress && (
          <>
            <Header
              setMarketplaceAddress={setMarketplaceAddress}
              marketplaceAddress={marketplaceAddress as `0x${string}`}
            />
          </>
        )}

        <Routes>
          <Route path="/" element={<Home />}></Route>

          <Route path=":contractAddress">
            <Route
              path="market/"
              element={<Market setMarketplaceAddress={setMarketplaceAddress} />}
            />
            <Route
              path="my-nfts/"
              element={<MyNfts setMarketplaceAddress={setMarketplaceAddress} />}
            />
          </Route>
        </Routes>
      </RainbowKitProvider>
    </HashRouter>
  );
}

export default App;
