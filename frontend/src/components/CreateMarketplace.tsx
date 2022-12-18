import * as Yup from "yup";

import {
  Box,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";

import Button from "@mui/material/Button";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import { LoadingButton } from "@mui/lab";
import React from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

interface Props {
  window?: () => Window;
}

type UserSubmitForm = {
  tokenAddress: `0x${string}`;
  allowedNftAddresses: `0x${string}`[];
};

export default function CreateMarketplace(props: Props) {
  const { window } = props;
  const isMobile = useMediaQuery("(max-width:899px)");
  const [open, setOpen] = React.useState(false);
  const [deploying, setDeploying] = React.useState(false);
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };
  const container =
    window !== undefined ? () => window().document.body : undefined;

  const validationSchema = Yup.object().shape({
    tokenAddress: Yup.string().required("*required"),
    allowedNftAddresses: Yup.string().required("*required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSubmitForm>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (formData: UserSubmitForm) => {
    setDeploying(true);
    console.log(formData);
  };

  return (
    <>
      <Button
        onClick={toggleDrawer(true)}
        variant={"outlined"}
        color={"secondary"}
      >
        Create My Marketplace
      </Button>

      <SwipeableDrawer
        container={container}
        anchor="top"
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        disableSwipeToOpen={true}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Box
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "80%" : "50%",
            height: "100%",
          }}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
          noValidate
        >
          <Box sx={{ width: "100%", height: "5px", marginBottom: "1rem" }}>
            {deploying && <LinearProgress color="inherit" />}
          </Box>

          <Stack
            direction="column"
            sx={{
              alignItems: "center",
            }}
          >
            <Typography variant="h6" component="h2">
              Deploy Your Contract And Create Your Own Marketplace
            </Typography>

            <Box
              sx={{
                width: "70%",
              }}
            >
              <TextField
                label="ERC20 Token Address"
                maxRows={1}
                sx={{
                  width: "100%",
                  color: "#374151",
                  appearance: "none",
                }}
                variant="standard"
                {...register("tokenAddress")}
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
                {errors.tokenAddress?.message}
              </Typography>
            </Box>

            <Box
              sx={{
                width: "70%",
              }}
            >
              <TextField
                label="Allowed ERC721 Token Addresses"
                maxRows={1}
                sx={{
                  width: "100%",
                  color: "#374151",
                  appearance: "none",
                }}
                variant="standard"
                {...register("allowedNftAddresses")}
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
                {errors.allowedNftAddresses?.message}
              </Typography>
            </Box>

            <LoadingButton
              endIcon={<LibraryAddIcon />}
              type="submit"
              variant="outlined"
              loadingPosition="end"
              loading={deploying}
              sx={{ marginBottom: 2 }}
            >
              Deploy
            </LoadingButton>
          </Stack>
        </Box>
      </SwipeableDrawer>
    </>
  );
}
