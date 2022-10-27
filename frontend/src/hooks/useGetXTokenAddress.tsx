import { marketplaceAbi } from "../lib/utils";
import { useContractRead } from "wagmi";

export default function useGetXTokenAddress(marketplaceAddress: string) {
  const { data: xTokenResult } = useContractRead({
    addressOrName: marketplaceAddress,
    contractInterface: marketplaceAbi,
    functionName: "xToken",
  });

  const xTokenAddress: string | undefined = xTokenResult as string | undefined;

  return { xTokenAddress };
}
