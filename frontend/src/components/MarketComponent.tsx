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
import { erc20ABI, useAccount, useContractWrite } from "wagmi";
import { interfaces, marketplaceAbi } from "../lib/utils";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { LoadingButton } from "@mui/lab";
import React from "react";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import useGetAllowance from "../hooks/useGetAllowance";
import useGetBalance from "../hooks/useGetBalance";
import useGetListings from "../hooks/useGetListings";
import useGetXTokenAddress from "../hooks/useGetXTokenAddress";

export default function MarketComponent({
  marketplaceAddress,
}: {
  marketplaceAddress: string;
}) {
  const isMobile = useMediaQuery("(max-width:899px)");
  const { isConnected, isConnecting, isReconnecting, address } = useAccount();
  const [buyNftListing, setBuyNftListing] =
    React.useState<interfaces.Listing>();
  const [buyingNft, setBuyingNft] = React.useState(false);
  const [givingAllowance, setGivingAllowance] = React.useState(false);

  const { data: market, isLoading } = useGetListings(
    marketplaceAddress,
    isConnected,
    isConnecting,
    isReconnecting
  );

  const { xTokenAddress } = useGetXTokenAddress(marketplaceAddress);
  const { balance } = useGetBalance(xTokenAddress);
  const { allowance } = useGetAllowance(xTokenAddress, marketplaceAddress);

  const buyNft = (listing: interfaces.Listing) => {
    setBuyNftListing(listing);
  };

  const { writeAsync: buyNftWriteAsync } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: marketplaceAddress,
    contractInterface: marketplaceAbi,
    functionName: "buy",
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
        setBuyingNft(false);
        setBuyNftListing(undefined);
      }
    },
  });

  const { writeAsync: approveWriteAsync } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: xTokenAddress ? xTokenAddress : "",
    contractInterface: erc20ABI,
    functionName: "approve",
    async onSettled(data, error) {
      if (data) {
        setGivingAllowance(true);

        const transaction = await data?.wait();

        if (transaction.confirmations >= 1) {
          setGivingAllowance(false);
        }
      }

      if (error?.name && error.message) {
        setGivingAllowance(false);
      }
    },
  });

  const nftBuy = async () => {
    if (Number(allowance) >= Number(buyNftListing?.price)) {
      await buyNftWriteAsync({
        recklesslySetUnpreparedArgs: [buyNftListing?.id],
      });
    } else {
      await approveWriteAsync({
        recklesslySetUnpreparedArgs: [marketplaceAddress, buyNftListing?.price],
      });
    }
  };

  const { writeAsync: cancelMarketWrite } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: marketplaceAddress,
    contractInterface: marketplaceAbi,
    functionName: "cancelMarket",
    async onSettled(data, error) {
      if (data) {
        const transaction = await data?.wait();

        if (transaction.confirmations >= 1) {
        }
      }

      if (error?.name && error.message) {
      }
    },
  });

  function cancelMarket(listingId: number) {
    cancelMarketWrite({ recklesslySetUnpreparedArgs: [listingId] });
  }

  return (
    <>
      {(isConnecting || isReconnecting || isLoading) && <Loader />}

      {!isConnecting && !isReconnecting && !isConnected && !isLoading && (
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

      {!isConnecting && !isReconnecting && isConnected && !isLoading && (
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
              if (!buyingNft && !givingAllowance) {
                setBuyNftListing(undefined);
              }
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
                  Buy
                </LoadingButton>
              ) : (
                <LoadingButton
                  onClick={() => {
                    nftBuy();
                  }}
                  loading={givingAllowance}
                  sx={{ color: "green" }}
                >
                  Give allowance
                </LoadingButton>
              )}

              <Button
                onClick={() => {
                  if (!buyingNft && !givingAllowance) {
                    setBuyNftListing(undefined);
                  }
                }}
                variant="outlined"
                autoFocus
                disabled={buyingNft || givingAllowance}
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
            {market && market.total !== 0
              ? market?.listings.map((listing) => {
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
                              onClick={() => {
                                cancelMarket(listing.id);
                              }}
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
