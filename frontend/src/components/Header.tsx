import * as React from "react";

import { BigNumber, ethers } from "ethers";
import { useAccount, useNetwork } from "wagmi";

import AdbIcon from "@mui/icons-material/Adb";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import { LoadingButton } from "@mui/lab";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { currentChain } from "../lib/wagmi";
import { headerPages } from "../lib/utils";
import useDebugFaucet from "../hooks/useDebugFaucet";
import useGetBalance from "../hooks/useGetBalance";
import useGetXTokenAddress from "../hooks/useGetXTokenAddress";
import { useNavigate } from "react-router-dom";

export default function Header({
  marketplaceAddress,
}: {
  marketplaceAddress: `0x${string}`;
}) {
  const { chain: useNetworkChain } = useNetwork();
  const { address } = useAccount();
  const navigate = useNavigate();
  const { xTokenAddress } = useGetXTokenAddress(marketplaceAddress);
  const { balance } = useGetBalance(xTokenAddress);
  const { debugFaucetWriteAsync, loadingFaucet } =
    useDebugFaucet(marketplaceAddress);

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
              <LoadingButton
                color={"success"}
                sx={{
                  backgroundColor: "white",
                  borderRadius: "0.5rem",
                  ":hover": {
                    backgroundColor: "white",
                  },
                }}
                onClick={() => {
                  debugFaucetWriteAsync?.();
                }}
                loading={loadingFaucet}
              >
                Debug Faucet (10 X)
              </LoadingButton>
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
          {useNetworkChain?.name !== currentChain.name && address && (
            <div>Change network to {currentChain.name}</div>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
