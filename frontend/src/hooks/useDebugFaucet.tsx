import React from "react";
import { useContractWrite } from "wagmi";
import useGetXTokenAddress from "../hooks/useGetXTokenAddress";
import { xTokenAbi } from "../lib/utils";

export default function useDebugFaucet(marketplaceAddress: string) {
  const [loadingFaucet, setLoadingFaucet] = React.useState(false);
  const { xTokenAddress } = useGetXTokenAddress(marketplaceAddress);

  const { writeAsync: debugFaucetWriteAsync } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: xTokenAddress ? xTokenAddress : "",
    contractInterface: xTokenAbi,
    functionName: "debugFaucet",
    async onSettled(data, error) {
      if (data) {
        setLoadingFaucet(true);

        const transaction = await data?.wait();

        if (transaction.confirmations >= 1) {
          setLoadingFaucet(false);
        }
      }

      if (error?.name && error.message) {
        setLoadingFaucet(false);
      }
    },
  });

  return { debugFaucetWriteAsync, loadingFaucet };
}
