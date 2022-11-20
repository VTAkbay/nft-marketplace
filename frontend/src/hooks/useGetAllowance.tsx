import { erc20ABI, useAccount, useContractRead } from "wagmi";

export default function useGetAllowance(
  tokenAddress: `0x${string}` | undefined,
  marketplaceAddress: `0x${string}`
) {
  const { address: userAddress } = useAccount();

  const { data: allowanceResult } = useContractRead({
    address: tokenAddress ? tokenAddress : "",
    abi: erc20ABI,
    functionName: "allowance",
    args: [userAddress!, marketplaceAddress],
    watch: true,
    enabled: Boolean(tokenAddress && userAddress),
  });

  const allowance: number | undefined = allowanceResult as number | undefined;

  return { allowance };
}
