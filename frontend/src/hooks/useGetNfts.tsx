import {
  erc721ABI,
  useAccount,
  useContractRead,
  useContractReads,
} from "wagmi";
import { interfaces, marketplaceAbi } from "../lib/utils";

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
    addressOrName: contractAddress,
    contractInterface: erc721ABI,
    functionName: "balanceOf",
    watch: true,
    args: [address],
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
            addressOrName: contractAddress,
            contractInterface: erc721ABI,
            functionName: "tokenOfOwnerByIndex",
            args: [address, index],
          }))
      : [],
    watch: true,
  });

  const nftIds: BigNumber[] | undefined = nftIdsResult as
    | BigNumber[]
    | undefined;

  const { data: nftsResult } = useContractReads({
    contracts: nftIds
      ? nftIds.map((nftId) => ({
          addressOrName: contractAddress,
          contractInterface: erc721ABI,
          functionName: "tokenURI",
          args: [nftId],
        }))
      : [],
    watch: true,
  });

  const { data: listedNftIdsResult } = useContractReads({
    contracts: nftIds
      ? nftIds.map((nftId) => ({
          addressOrName: marketplaceAddress,
          contractInterface: marketplaceAbi,
          functionName: "listingTokenIds",
          args: [Number(nftId)],
        }))
      : [],
    watch: true,
  });

  const listedNftIds: boolean[] | undefined = listedNftIdsResult as
    | []
    | undefined;

  const { data: allowanceResult } = useContractReads({
    contracts: nftIds
      ? nftIds.map((nftId) => ({
          addressOrName: contractAddress,
          contractInterface: erc721ABI,
          functionName: "getApproved",
          args: [nftId],
        }))
      : [],
    watch: true,
    enabled: Boolean(nftIds),
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
