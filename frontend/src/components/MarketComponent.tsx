import { BigNumber, ethers } from "ethers";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Dialog,
  DialogActions,
  DialogTitle,
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
  useContractWrite,
} from "wagmi";
import { marketplaceAbi, xTokenAbi } from "../lib/utils";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { LoadingButton } from "@mui/lab";
import React from "react";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

declare module interfaces {
  export interface Listing {
    id: number;
    tokenAddress: string;
    tokenId: number;
    seller: string;
    price: BigNumber;
    tokenURI: string;
  }
  export interface Listings {
    listings: Listing[];
    total: number;
  }
}

export default function MarketComponent({
  marketplaceAddress,
}: {
  marketplaceAddress: string;
}) {
  const isMobile = useMediaQuery("(max-width:899px)");
  const { isConnected, isConnecting, isReconnecting, address } = useAccount();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<interfaces.Listings>();
  const [buyNftListing, setBuyNftListing] =
    React.useState<interfaces.Listing>();
  const [buyingNft, setBuyingNft] = React.useState(false);
  const [givingAllowance, setGivingAllowance] = React.useState(false);
  const [enabledRead, setEnabledRead] = React.useState(false);

  React.useEffect(() => {
    if (isConnected && !isConnecting && !isReconnecting && address) {
      setEnabledRead(true);
    }
  }, [isConnected, isConnecting, isReconnecting, address]);

  const { data: xTokenResult } = useContractRead({
    addressOrName: marketplaceAddress,
    contractInterface: marketplaceAbi,
    functionName: "xToken",
  });

  const xTokenAddress = xTokenResult as string | undefined;

  const { data: balance } = useContractRead({
    addressOrName: xTokenAddress ? xTokenAddress : "",
    contractInterface: xTokenAbi,
    functionName: "balanceOf",
    args: [address],
    watch: true,
    enabled: Boolean(xTokenAddress),
  });

  const { data: listingsLengthResults } = useContractRead({
    addressOrName: marketplaceAddress,
    contractInterface: marketplaceAbi,
    functionName: "getListingsLength",
    watch: true,
    enabled: enabledRead,
  });

  const listingsLength = Number(listingsLengthResults);

  const { data: listings } = useContractReads({
    contracts: listingsLength
      ? Array(listingsLength)
          .fill(0)
          .map((i, index) => ({
            addressOrName: marketplaceAddress,
            contractInterface: marketplaceAbi,
            functionName: "listings",
            args: [index],
          }))
      : [],
    watch: true,
    allowFailure: true,
    enabled: Boolean(listingsLength),
  });

  const { data: tokenURIsResult } = useContractReads({
    contracts: listings
      ? listings.map((listing) => ({
          addressOrName: listing.tokenAddress,
          contractInterface: erc721ABI,
          functionName: "tokenURI",
          args: [BigNumber.from(listing.tokenId)],
        }))
      : [],
    watch: true,
    allowFailure: true,
    enabled: Boolean(listings),
  });

  const tokenURIs: string[] | undefined = tokenURIsResult as
    | string[]
    | undefined;

  React.useEffect(() => {
    if (listings && tokenURIs && !isConnecting && !isReconnecting) {
      if (listings?.length === 0) {
        setLoading(false);
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
        setLoading(false);
        return;
      }
    }
  }, [address, isConnecting, isReconnecting, listings, tokenURIs]);

  const buyNft = (listing: interfaces.Listing) => {
    setBuyNftListing(listing);
  };

  const { writeAsync: buyNftWrite } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: marketplaceAddress,
    contractInterface: marketplaceAbi,
    functionName: "buy",
    args: [buyNftListing?.id],
    async onSettled(data, error) {
      if (data) {
        setBuyingNft(true);

        const transaction = await data?.wait();

        if (transaction.confirmations >= 1) {
          setBuyingNft(false);
          setBuyNftListing(undefined);
        }
      }

      if (error?.name && error.message) {
        // error handling
      }

      setBuyingNft(false);
      setBuyNftListing(undefined);
    },
  });

  const { data: allowance } = useContractRead({
    addressOrName: xTokenAddress ? xTokenAddress : "",
    contractInterface: xTokenAbi,
    functionName: "allowance",
    args: [address, marketplaceAddress],
    watch: true,
  });

  const { writeAsync: approve } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: xTokenAddress ? xTokenAddress : "",
    contractInterface: xTokenAbi,
    functionName: "approve",
    args: [marketplaceAddress, buyNftListing?.price],
    async onSettled(data, error) {
      if (data) {
        setGivingAllowance(true);

        const transaction = await data?.wait();

        if (transaction.confirmations >= 1) {
          setGivingAllowance(false);
        }
      }

      if (error?.name && error.message) {
        // error handling for add copy
      }

      setGivingAllowance(false);
    },
  });

  function nftBuy() {
    try {
      if (Number(allowance) >= Number(buyNftListing?.price)) {
        buyNftWrite();
      } else {
        approve();
      }
    } catch {}
  }

  return (
    <>
      {(isConnecting || isReconnecting || loading) && <Loader />}

      {!isConnecting && !isReconnecting && !isConnected && !loading && (
        <Box display="flex" justifyContent="center" marginTop="2rem">
          <ConnectButton
            chainStatus="none"
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />
        </Box>
      )}

      {!isConnecting && !isReconnecting && isConnected && !loading && (
        <Container
          maxWidth="lg"
          sx={{
            marginTop: "1rem",
            marginBottom: "1rem",
            justifyContent: "center",
          }}
        >
          <Dialog
            open={Boolean(buyNftListing)}
            onClose={() => {
              if (!buyingNft) setBuyNftListing(undefined);
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {`Do you want to buy NFT for ${
                buyNftListing &&
                ethers.utils.formatEther(BigNumber.from(buyNftListing?.price))
              } XToken`}
            </DialogTitle>
            <DialogActions>
              {Number(allowance) >= Number(buyNftListing?.price) ? (
                <LoadingButton
                  onClick={() => {
                    nftBuy();
                  }}
                  loading={buyingNft}
                  sx={{ color: "green" }}
                >
                  {!buyingNft ? "Buy" : "Buying the NFT, please wait!"}
                </LoadingButton>
              ) : (
                <LoadingButton
                  onClick={() => {
                    nftBuy();
                  }}
                  loading={givingAllowance}
                  sx={{ color: "green" }}
                >
                  {!givingAllowance ? "Give allowance" : "Please wait!"}
                </LoadingButton>
              )}

              <Button
                onClick={() => {
                  setBuyNftListing(undefined);
                }}
                variant="outlined"
                autoFocus
                disabled={buyingNft}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
          <Grid
            container
            spacing={{ xs: 1, md: 2 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
            justifyContent="center"
            alignItems="center"
          >
            {data && data.listings.length
              ? data?.listings.map((listing) => {
                  const priceInETH = ethers.utils.formatEther(
                    BigNumber.from(listing.price)
                  );
                  return (
                    <Grid xs={2} sm={4} md={4} key={listing.id} item>
                      <Card variant="outlined">
                        <CardActionArea
                          component={Link}
                          to={`/listing/${listing.id}`}
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
                              ID: {listing.id}
                            </Typography>
                            <Typography
                              gutterBottom
                              variant={isMobile ? "body2" : "body1"}
                            >
                              Price: {priceInETH} X
                            </Typography>
                            <Typography
                              gutterBottom
                              variant={isMobile ? "body2" : "body1"}
                            >
                              URI: {listing.tokenURI}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                        <CardActions>
                          {listing.seller !== address ? (
                            <IconButton
                              disabled={
                                Number(balance) <= Number(listing.price)
                              }
                              aria-label="buy-nft"
                              onClick={() => {
                                Number(balance) >= Number(listing.price) &&
                                  buyNft(listing);
                              }}
                              color="success"
                              size="large"
                            >
                              <ShoppingCartIcon />
                              {Number(balance) >= Number(listing.price)
                                ? "Buy"
                                : "Not enough XToken"}
                            </IconButton>
                          ) : (
                            <Button
                              aria-label="cancel-listing"
                              onClick={() => {}}
                            >
                              Cancel Listing
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })
              : "There is no any NFT on the market, sorry."}
          </Grid>
        </Container>
      )}
    </>
  );
}
