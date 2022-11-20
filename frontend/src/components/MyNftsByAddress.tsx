import * as Yup from "yup";

import {
  Alert,
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { erc721ABI, useAccount, useContractWrite } from "wagmi";
import { interfaces, isZeroAddress, marketplaceAbi } from "../lib/utils";

import Loader from "./Loader";
import { LoadingButton } from "@mui/lab";
import React from "react";
import SellIcon from "@mui/icons-material/Sell";
import { ethers } from "ethers";
import { useForm } from "react-hook-form";
import useGetNfts from "../hooks/useGetNfts";
import { yupResolver } from "@hookform/resolvers/yup";

export default function MyNftsByAddress({
  contractAddress,
  marketplaceAddress,
}: {
  contractAddress: `0x${string}`;
  marketplaceAddress: `0x${string}`;
}) {
  const { data, isLoading } = useGetNfts(contractAddress, marketplaceAddress);
  const { isConnecting, isReconnecting } = useAccount();
  const isMobile = useMediaQuery("(max-width:899px)");
  const [listNft, setListNft] = React.useState<interfaces.Nft>();
  const [listingNft, setListingNft] = React.useState(false);
  const [listingErrorMessage, setListingErrorMessage] = React.useState("");
  const [listingConfirming, setListingConfirming] = React.useState(false);
  const [givingAllowance, setGivingAllowance] = React.useState(false);

  const validationSchema = Yup.object().shape({
    price: Yup.number()
      .required("You have to enter amount of X")
      .positive()
      .moreThan(0.0000001, "Minimum list price 0.0000001 X"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<interfaces.ListNftSubmitForm>({
    resolver: yupResolver(validationSchema),
  });

  const { writeAsync: marketWriteAsync } = useContractWrite({
    address: marketplaceAddress,
    abi: marketplaceAbi,
    mode: "recklesslyUnprepared",
    functionName: "market",
    async onSettled(data, error) {
      if (data) {
        setListingConfirming(true);
        handleCloseListNftDialog();
        setListingNft(false);

        const transaction = await data.wait();

        if (transaction.confirmations >= 1) {
          setListingConfirming(false);
        }
      }

      if (
        error?.name &&
        error.message &&
        !String(error).startsWith("Error: user rejected transaction")
      ) {
        setListingConfirming(false);
        setListingNft(false);
        setListingErrorMessage(error.message);
      }
    },
  });

  const { writeAsync: approveWriteAsync } = useContractWrite({
    mode: "recklesslyUnprepared",
    address: contractAddress ? contractAddress : "",
    abi: erc721ABI,
    functionName: "approve",
    async onSettled(data, error) {
      if (data) {
        setGivingAllowance(true);

        const transaction = await data.wait();

        if (transaction.confirmations >= 1) {
          setGivingAllowance(false);
        }
      }

      if (error?.name && error.message) {
      }

      setGivingAllowance(false);
    },
  });

  const onSubmit = async (formData: interfaces.ListNftSubmitForm) => {
    if (isZeroAddress(listNft?.approvedBy)) {
      approveWriteAsync?.({
        recklesslySetUnpreparedArgs: [
          marketplaceAddress,
          ethers.BigNumber.from(listNft!.tokenId),
        ],
      });
    }
    marketWriteAsync?.({
      recklesslySetUnpreparedArgs: [
        listNft?.tokenAddress,
        listNft?.tokenId,
        ethers.utils.parseUnits(String(formData.price), "ether"),
      ],
    });
  };

  function handleCloseListNftDialog() {
    !listingNft && setListNft(undefined);
  }

  return (
    <>
      {(isConnecting || isReconnecting || isLoading) && <Loader />}

      {data?.nfts && !isConnecting && !isReconnecting && !isLoading && (
        <>
          <Dialog
            open={Boolean(listNft)}
            onClose={handleCloseListNftDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              Do you want to list {listNft?.tokenURI} NFT?
            </DialogTitle>
            <DialogContent>
              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
                noValidate
              >
                <Box
                  sx={{ width: "100%", height: "5px", marginBottom: "1rem" }}
                >
                  {listingNft && <LinearProgress color="inherit" />}
                </Box>

                <Stack
                  direction="column"
                  sx={{
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: "70%",
                      marginBottom: "3rem",
                    }}
                  >
                    <TextField
                      label="Price"
                      maxRows={1}
                      defaultValue={0}
                      pattern="[0-9]+"
                      sx={{
                        width: "100%",
                        color: "#374151",
                        appearance: "none",
                      }}
                      variant="standard"
                      {...register("price")}
                      type="number"
                    />
                    <Typography
                      sx={{
                        color: "#EF4444",
                        fontSize: "0.75rem",
                        width: "100%",
                        height: "10px",
                        marginTop: "5px",
                      }}
                    >
                      {errors.price?.message}
                    </Typography>
                  </Box>

                  <LoadingButton
                    type="submit"
                    variant="outlined"
                    loading={listingNft || givingAllowance}
                  >
                    List
                  </LoadingButton>
                </Stack>
              </Box>
            </DialogContent>
            <DialogActions>
              <LoadingButton
                onClick={handleCloseListNftDialog}
                variant="outlined"
                autoFocus
                loading={listingNft}
              >
                Cancel
              </LoadingButton>
            </DialogActions>
          </Dialog>

          {data.nfts.length !== 0 &&
            data.nfts.map((nft) => {
              return (
                <Grid xs={2} sm={4} md={4} key={nft.tokenId} item>
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
                        {nft.tokenURI}
                      </Typography>
                    </CardContent>

                    <CardActions>
                      <IconButton
                        size="large"
                        color="error"
                        onClick={() => {
                          setListNft({
                            tokenURI: nft.tokenURI,
                            tokenAddress: contractAddress,
                            tokenId: nft.tokenId,
                            approvedBy: nft.approvedBy,
                            listed: nft.listed,
                          });
                        }}
                        disabled={nft.listed}
                      >
                        <SellIcon />
                      </IconButton>
                      {nft.listed && "Listed"}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}

          <Snackbar open={Boolean(listingErrorMessage)} autoHideDuration={5000}>
            <Alert severity="warning" sx={{ width: "100%" }}>
              {listingErrorMessage}!
            </Alert>
          </Snackbar>

          <Snackbar open={listingConfirming}>
            <Alert severity="success" sx={{ width: "100%" }}>
              Confirming the transaction, please wait!
            </Alert>
          </Snackbar>

          {data.nfts.length === 0 && (
            <Box margin={3}>
              There is no any NFT currently allowed by Marketplace Contract
            </Box>
          )}
        </>
      )}
    </>
  );
}
