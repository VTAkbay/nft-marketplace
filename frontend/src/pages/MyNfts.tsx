import { Box } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import MyNftsComponent from "../components/MyNftsComponent";
import React from "react";
import { useAccount } from "wagmi";
import { useParams } from "react-router-dom";

export default function MyNfts({
  setMarketplaceAddress,
}: {
  setMarketplaceAddress: (adr: string) => void;
}) {
  const { contractAddress } = useParams();
  const { address } = useAccount();

  React.useEffect(() => {
    setMarketplaceAddress(contractAddress ?? "");
  }, [contractAddress, setMarketplaceAddress]);

  return (
    <>
      {address && (
        <MyNftsComponent
          marketplaceAddress={contractAddress ?? ""}
        ></MyNftsComponent>
      )}
      {!address && (
        <Box display="flex" justifyContent="center" marginTop="2rem">
          <ConnectButton
            chainStatus="none"
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />
        </Box>
      )}
    </>
  );
}
