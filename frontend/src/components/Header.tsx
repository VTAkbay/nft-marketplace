import * as React from "react";

import { BigNumber, ethers } from "ethers";
import { headerPages, marketplaceAbi, xTokenAbi } from "../lib/utils";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";

import AdbIcon from "@mui/icons-material/Adb";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

export default function Header({
  marketplaceAddress,
}: {
  marketplaceAddress: string;
}) {
  const { address } = useAccount();
  const navigate = useNavigate();

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

  const { config: faucetConfig } = usePrepareContractWrite({
    addressOrName: xTokenAddress ? xTokenAddress : "",
    contractInterface: xTokenAbi,
    functionName: "debugFaucet",
  });
  const { write } = useContractWrite(faucetConfig);

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile */}
          <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            onClick={() => {
              navigate(`${marketplaceAddress}`);
            }}
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Nft Market
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {headerPages.map((page) => (
                <MenuItem
                  key={page.key}
                  onClick={() => {
                    handleCloseNavMenu();
                    navigate(`${marketplaceAddress}/${page.route}`);
                  }}
                >
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          {/* Normal */}
          <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            onClick={() => {
              navigate(`${marketplaceAddress}`);
            }}
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Nft Market
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {headerPages.map((page) => (
              <Button
                key={page.key}
                onClick={() => {
                  handleCloseNavMenu();
                  navigate(`${marketplaceAddress}/${page.route}`);
                }}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          {address && (
            <Box
              sx={{
                margin: 2,
                fontSize: 20,
                color: "black",
                fontWeight: "bold",
                backgroundColor: "white",
                borderRadius: 2,
                padding: 1,
              }}
            >
              Balance:{" "}
              {balance
                ? ethers.utils.formatEther(BigNumber.from(balance))
                : "N/A"}{" "}
              X
            </Box>
          )}

          <Box marginRight={2}>
            {address && (
              <Button
                color={"success"}
                sx={{
                  backgroundColor: "white",
                  borderRadius: "0.5rem",
                  ":hover": {
                    backgroundColor: "white",
                  },
                }}
                onClick={() => {
                  write?.();
                }}
              >
                Debug Faucet (10 X)
              </Button>
            )}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <ConnectButton
              chainStatus="none"
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
            />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}