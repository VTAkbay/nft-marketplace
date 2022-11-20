import { Container, Grid } from "@mui/material";
import { useContractRead, useContractReads } from "wagmi";

import MyNftsByAddress from "./MyNftsByAddress";
import { marketplaceAbi } from "../lib/utils";

export default function MyNftsComponent({
  marketplaceAddress,
}: {
  marketplaceAddress: `0x${string}`;
}) {
  const { data: allowedAddressLength } = useContractRead({
    address: marketplaceAddress,
    abi: marketplaceAbi,
    functionName: "getAllowedNftAddressesLength",
    watch: true,
  });

  const { data: allowedAddressesResult } = useContractReads({
    contracts: allowedAddressLength
      ? Array(Number(allowedAddressLength))
          .fill(0)
          .map((i, index) => ({
            address: marketplaceAddress,
            abi: marketplaceAbi,
            functionName: "allowedNftAddresses",
            args: [index],
          }))
      : [],
    watch: true,
    enabled: Boolean(allowedAddressLength),
  });

  const allowedAddresses: `0x${string}`[] = allowedAddressesResult as [];

  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          marginTop: "1rem",
          marginBottom: "1rem",
          justifyContent: "center",
        }}
      >
        <Grid
          container
          spacing={{ xs: 1, md: 2 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          justifyContent="center"
          alignItems="center"
        >
          {allowedAddresses &&
            allowedAddresses.map((address) => (
              <MyNftsByAddress
                marketplaceAddress={marketplaceAddress}
                contractAddress={address}
                key={address}
              ></MyNftsByAddress>
            ))}
        </Grid>
      </Container>
    </>
  );
}
