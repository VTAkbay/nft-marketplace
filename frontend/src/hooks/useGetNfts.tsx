import { interfaces, marketplaceAbi, xNftAbi } from "../lib/utils";
import { useAccount, useContractRead, useContractReads } from "wagmi";

import { BigNumber } from "ethers";
import React from "react";

export default function useGetNfts(
  contractAddress: string,
  marketplaceAddress: string
) {
  const { isConnecting, isReconnecting, address } = useAccount();
  const [data, setData] = React.useState<interfaces.Nfts>();
  const [isLoading, setIsLoading] = React.useState(true);

  const { data: balanceOfResult } = useContractRead({
    address: contractAddress,
    abi: xNftAbi,
    functionName: "balanceOf",
    watch: true,
    enabled: Boolean(address),
    args: [address!],
    cacheOnBlock: true,
  });

  const balanceOf: BigNumber | undefined = balanceOfResult as
    | BigNumber
    | undefined;

  React.useEffect(() => {
    if (Number(balanceOf) === 0) {
      setData({ nfts: [], total: 0 });
      setIsLoading(false);
    }
  }, [balanceOf]);

  const { data: nftIdsResult } = useContractReads({
    contracts: balanceOf
      ? Array(balanceOf.toNumber())
          .fill(0)
          .filter((i) => i !== null)
          .map((i, index) => ({
            address: contractAddress,
            abi: xNftAbi,
            functionName: "tokenOfOwnerByIndex",
            args: [address, index],
          }))
      : [],
    watch: true,
    cacheOnBlock: true,
  });

  const nftIds: BigNumber[] | undefined = nftIdsResult as
    | BigNumber[]
    | undefined;

  const { data: nftsResult } = useContractReads({
    contracts: nftIds
      ? nftIds.map((nftId) => ({
          address: contractAddress,
          abi: xNftAbi,
          functionName: "tokenURI",
          args: [nftId],
        }))
      : [],
    watch: true,
  });

  const { data: listedNftIdsResult } = useContractReads({
    contracts: nftIds
      ? nftIds.map((nftId) => ({
          address: marketplaceAddress,
          abi: marketplaceAbi,
          functionName: "listingTokenIds",
          args: [Number(nftId)],
        }))
      : [],
    watch: true,
    cacheOnBlock: true,
  });

  const listedNftIds: boolean[] | undefined = listedNftIdsResult as
    | []
    | undefined;

  const { data: allowanceResult } = useContractReads({
    contracts: nftIds
      ? nftIds.map((nftId) => ({
          address: contractAddress,
          abi: xNftAbi,
          functionName: "getApproved",
          args: [nftId],
        }))
      : [],
    watch: true,
    enabled: Boolean(nftIds),
    cacheOnBlock: true,
  });

  const allowance: string[] | undefined = allowanceResult as [] | undefined;

  const nfts: string[] | undefined = nftsResult as string[] | undefined;

  React.useEffect(() => {
    if (
      nfts &&
      nftIds &&
      !isConnecting &&
      !isReconnecting &&
      address &&
      allowance &&
      listedNftIds
    ) {
      if (nftIds?.length === 0) {
        setIsLoading(false);
        return;
      } else {
        setData({
          nfts: nfts?.map((nft, index) => ({
            tokenAddress: contractAddress,
            tokenId: nftIds[index].toNumber(),
            tokenURI: nft,
            approvedBy: allowance?.[index],
            listed: listedNftIds[index],
          })),
          total: nftIds.length,
        });
        setIsLoading(false);
        return;
      }
    }
  }, [
    address,
    isConnecting,
    isReconnecting,
    nftIds,
    nfts,
    allowance,
    listedNftIds,
    contractAddress,
  ]);

  return { isLoading, data };
}
