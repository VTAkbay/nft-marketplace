import { BigNumber } from "ethers";

export { default as marketplaceAbi } from "../abi/contracts/Marketplace.sol/Marketplace.json";
export { default as xTokenAbi } from "../abi/contracts/XToken.sol/XToken.json";
export { default as xNftAbi } from "../abi/contracts/XNft.sol/XNft.json";

export const headerPages = [{ key: 0, title: "My Nfts", route: "my-nfts" }];

export const isDev =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export const devNetwork = process.env.REACT_APP_DEV_NETWORK;

export function isZeroAddress(address: string | undefined) {
  if (!address) {
    return null;
  }
  if (address === "0x0000000000000000000000000000000000000000") {
    return true;
  } else {
    return false;
  }
}

export declare module interfaces {
  export interface Listing {
    id: number;
    tokenAddress: string;
    tokenId: number;
    seller: string;
    price: BigNumber;
    tokenURI: string;
  }
  export interface Market {
    listings: Listing[];
    total: number;
  }

  export interface ListNftSubmitForm {
    price: string;
  }

  export interface Nft {
    tokenURI: string;
    tokenAddress: string;
    tokenId: number;
    approvedBy: string;
    listed: boolean;
  }

  export interface Nfts {
    nfts: Nft[];
    total: number;
  }
}
