import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  erc721ABI,
  useAccount,
  useContractRead,
  useContractReads,
} from "wagmi";

import { BigNumber } from "ethers";
import SellIcon from "@mui/icons-material/Sell";

export default function MyNftsByAddress({
  contractAddress,
}: {
  contractAddress: string;
}) {
  const isMobile = useMediaQuery("(max-width:899px)");
  const { address } = useAccount();

  const { data: balanceOfResult } = useContractRead({
    addressOrName: contractAddress!,
    contractInterface: erc721ABI,
    functionName: "balanceOf",
    watch: true,
    args: [address],
  });

  const balanceOf: BigNumber | undefined = balanceOfResult as
    | BigNumber
    | undefined;

  const { data: nftIdsResult } = useContractReads({
    contracts: balanceOf
      ? Array(balanceOf.toNumber())
          .fill(0)
          .map((i, index) => ({
            addressOrName: contractAddress,
            contractInterface: erc721ABI,
            functionName: "tokenOfOwnerByIndex",
            args: [address, index],
          }))
      : [],
    watch: true,
    allowFailure: true,
  });

  const nftIds: BigNumber[] | undefined = nftIdsResult as
    | BigNumber[]
    | undefined;

  const { data: nftsResult } = useContractReads({
    contracts: nftIds
      ? nftIds.map((i, index) => ({
          addressOrName: contractAddress,
          contractInterface: erc721ABI,
          functionName: "tokenURI",
          args: [index],
        }))
      : [],
    watch: true,
    allowFailure: true,
  });

  const nfts: string[] | undefined = nftsResult as string[] | undefined;

  return (
    <>
      {nfts?.length !== 0 &&
        nfts?.map((nft) => {
          return (
            <Grid xs={2} sm={4} md={4} key={nft} item>
              <Card
                variant="outlined"
                sx={{
                  ":hover": {
                    backgroundColor: "rgba(0,0,0, 0.03)",
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height={isMobile ? "80" : "200"}
                  image={"https://picsum.photos/1920/1080"}
                  alt="nft image"
                />

                <CardContent>
                  <Typography
                    gutterBottom
                    variant={isMobile ? "body2" : "body1"}
                  >
                    {nft}
                  </Typography>
                </CardContent>

                <CardActions>
                  <IconButton size="large" color="error">
                    <SellIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      {nfts?.length === 0 && (
        <Box margin={3}>
          There is no any NFT currently allowed by Marketplace Contract
        </Box>
      )}
    </>
  );
}
