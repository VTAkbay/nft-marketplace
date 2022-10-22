import "./App.css";
import "@rainbow-me/rainbowkit/styles.css";

import { HashRouter, Route, Routes } from "react-router-dom";
import { chains, ganacheChain } from "./lib/wagmi";

import Header from "./components/Header";
import Market from "./pages/Market";
import MyNfts from "./pages/MyNfts";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import React from "react";
import { chain } from "wagmi";
import { isDev } from "./lib/utils";

function App() {
  const [marketplaceAddress, setMarketplaceAddress] = React.useState("");

  return (
    <HashRouter>
      <RainbowKitProvider
        coolMode
        chains={chains}
        initialChain={isDev ? ganacheChain : chain.goerli}
        showRecentTransactions={true}
      >
        <Header marketplaceAddress={marketplaceAddress} />
        <Routes>
          <Route path=":contractAddress">
            <Route
              path=""
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
