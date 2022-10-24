import { erc721ABI, useContractRead, useContractReads } from "wagmi";
import { interfaces, marketplaceAbi } from "../lib/utils";

import { BigNumber } from "ethers";
import React from "react";

export default function useGetListings(
  address: string,
  isConnected: boolean,
  isConnecting: boolean,
  isReconnecting: boolean
) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [enabledRead, setEnabledRead] = React.useState(false);
  const [data, setData] = React.useState<interfaces.Market>();

  React.useEffect(() => {
    if (isConnected) {
      setEnabledRead(true);
    }
  }, [isConnected]);

  const { data: listingsLengthResults } = useContractRead({
    addressOrName: address,
    contractInterface: marketplaceAbi,
    functionName: "getListingsLength",
    watch: true,
    enabled: Boolean(enabledRead && isConnected),
    cacheOnBlock: true,
  });

  const listingsLength: number | undefined = Number(listingsLengthResults) as
    | number
    | undefined;

  React.useEffect(() => {
    if (listingsLength === 0) {
      setData({ listings: [], total: 0 });
      setIsLoading(false);
    }
  }, [listingsLength]);

  const { data: listingsResult } = useContractReads({
    contracts: listingsLength
      ? new Array(listingsLength).fill(0).map((i, index) => ({
          addressOrName: address,
          contractInterface: marketplaceAbi,
          functionName: "listings",
          args: [index],
        }))
      : [],
    enabled: Boolean(listingsLength && isConnected),
    watch: true,
    cacheOnBlock: true,
  });

  const listings: any[] | undefined = listingsResult as [] | undefined;

  const { data: tokenURIsResult } = useContractReads({
    contracts: listings
      ? listings
          .filter((listing) => listing !== null)
          .map((listing) => ({
            addressOrName: listing.tokenAddress,
            contractInterface: erc721ABI,
            functionName: "tokenURI",
            args: [BigNumber.from(listing.tokenId)],
          }))
      : [],
    enabled: Boolean(listings && isConnected),
    watch: true,
    cacheOnBlock: true,
  });

  const tokenURIs: string[] | undefined = tokenURIsResult as
    | string[]
    | undefined;

  React.useEffect(() => {
    if (
      listings &&
      listingsLength &&
      tokenURIs &&
      address &&
      !isConnecting &&
      !isReconnecting
    ) {
      if (listingsLength === 0) {
        setData({ listings: [], total: 0 });
        setIsLoading(false);
        return;
      } else {
        setData({
          listings: listings?.map((listing, index) => ({
            id: listing.id.toNumber(),
            tokenAddress: listing.tokenAddress,
            tokenId: listing.tokenId.toNumber(),
            seller: listing.seller,
            price: listing.price,
            tokenURI: tokenURIs[index],
          })),
          total: listings.length,
        });
        setIsLoading(false);
        return;
      }
    }
  }, [
    listings,
    listingsLength,
    tokenURIs,
    address,
    isConnecting,
    isReconnecting,
  ]);

  return { isLoading, data };
}
