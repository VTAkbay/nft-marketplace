import { erc20ABI, useAccount, useContractRead } from "wagmi";

import { BigNumber } from "ethers";

export default function useGetBalance(tokenAddress: string | undefined) {
  const { address } = useAccount();

  const { data: balanceResult } = useContractRead({
    address: tokenAddress ? tokenAddress : "",
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address!],
    watch: true,
    enabled: Boolean(tokenAddress && address),
  });

  const balance: BigNumber | undefined = balanceResult as BigNumber | undefined;

  return { balance };
}
