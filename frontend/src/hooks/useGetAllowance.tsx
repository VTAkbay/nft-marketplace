import { erc20ABI, useAccount, useContractRead } from "wagmi";

export default function useGetAllowance(
  tokenAddress: string | undefined,
  marketplaceAddress: string
) {
  const { address: userAddress } = useAccount();

  const { data: allowanceResult } = useContractRead({
    addressOrName: tokenAddress ? tokenAddress : "",
    contractInterface: erc20ABI,
    functionName: "allowance",
    args: [userAddress, marketplaceAddress],
    watch: true,
    enabled: Boolean(tokenAddress),
  });

  const allowance: number | undefined = allowanceResult as number | undefined;

  return { allowance };
}
