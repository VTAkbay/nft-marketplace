import { marketplaceAbi } from "../lib/utils";
import { useContractRead } from "wagmi";

export default function useGetXTokenAddress(marketplaceAddress: `0x${string}`) {
  const { data: xTokenResult } = useContractRead({
    address: marketplaceAddress,
    abi: marketplaceAbi,
    functionName: "xToken",
  });

  const xTokenAddress: `0x${string}` | undefined = xTokenResult as
    | `0x${string}`
    | undefined;

  return { xTokenAddress };
}
