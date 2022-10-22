export { default as marketplaceAbi } from "../abi/contracts/Marketplace.sol/Marketplace.json";
export { default as xTokenAbi } from "../abi/contracts/XToken.sol/XToken.json";
export { default as xNftAbi } from "../abi/contracts/XNft.sol/XNft.json";

export const headerPages = [{ key: 0, title: "My Nfts", route: "my-nfts" }];

export const isDev =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";
