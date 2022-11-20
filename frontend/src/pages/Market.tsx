import MarketComponent from "../components/MarketComponent";
import React from "react";
import { useParams } from "react-router-dom";

export default function Market({
  setMarketplaceAddress,
}: {
  setMarketplaceAddress: (adr: string) => void;
}) {
  const { contractAddress } = useParams();

  React.useEffect(() => {
    setMarketplaceAddress(contractAddress ?? "");
  }, [contractAddress, setMarketplaceAddress]);

  return (
    <>
      {contractAddress && (
        <MarketComponent
          marketplaceAddress={contractAddress as `0x${string}`}
        />
      )}
      {Boolean(contractAddress) || <>No Contract</>}
    </>
  );
}
