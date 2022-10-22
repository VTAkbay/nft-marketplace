import { Box, Container, useTheme } from "@mui/material";

import { Triangle } from "react-loader-spinner";

const Loader = () => {
  const theme = useTheme();

  return (
    <Container fixed>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vw",
        }}
      >
        <Triangle
          height="80"
          width="80"
          color={theme.palette.mode === "dark" ? "white" : "black"}
          ariaLabel="triangle-loading"
        />
      </Box>
    </Container>
  );
};

export default Loader;
