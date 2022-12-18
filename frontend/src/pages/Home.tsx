import * as Yup from "yup";

import { Box, TextField, Typography } from "@mui/material";

import Button from "@mui/material/Button";
import CreateMarketplace from "../components/CreateMarketplace";
import { Global } from "@emotion/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";

export default function Home() {
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    address: Yup.string()
      .required("*required")
      .min(42, "Should be minimum 42 characters")
      .max(42, "Should be maximum 42 characters"),
  });

  const {
    register,
    handleSubmit,
    // formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (formData: any) => {
    navigate(`${formData.address}/market`, { replace: false });
  };

  return (
    <>
      <Global
        styles={{
          ".MuiDrawer-root > .MuiPaper-root": {
            height: "65vh",
          },
        }}
      />

      <Box
        sx={{
          position: "absolute" as "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "50vw",
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
          textAlign: "center",
          pt: 1,
          borderRadius: "1rem",
        }}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          marginTop={2}
        >
          Enter Marketplace Contract Address
        </Typography>

        <TextField
          label="Contract Address"
          maxRows={1}
          sx={{
            width: "100%",
            color: "#374151",
            appearance: "none",
            mt: 2,
            mb: 2,
          }}
          variant="standard"
          {...register("address")}
        />

        <Button type="submit" variant={"contained"} color={"success"}>
          Go to market
        </Button>
        <Typography margin={2}>Or</Typography>

        <CreateMarketplace></CreateMarketplace>
      </Box>
    </>
  );
}
