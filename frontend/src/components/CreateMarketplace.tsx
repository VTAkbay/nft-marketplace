import * as Yup from "yup";

import {
  Box,
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  marketplaceAbi,
  marketplaceByteCode,
  xNftAbi,
  xNftByteCode,
  xTokenAbi,
  xTokenByteCode,
} from "../lib/utils";
import { useAccount, useSigner } from "wagmi";

import Button from "@mui/material/Button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import { LoadingButton } from "@mui/lab";
import React from "react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { ethers } from "ethers";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";

interface Props {
  window?: () => Window;
}

type UserSubmitForm = {
  tokenAddress: `0x${string}`;
  allowedNftAddresses: `0x${string}`[];
};

export default function CreateMarketplace(props: Props) {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { data: signer, isError, isLoading } = useSigner();
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
    // tokenAddress: Yup.string().required("*required"),
    // allowedNftAddresses: Yup.string().required("*required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSubmitForm>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (formData: UserSubmitForm) => {
    if (signer) {
      setDeploying(true);
      console.log(formData);

      const contractFactory = new ethers.ContractFactory(
        xTokenAbi,
        xTokenByteCode,
        signer
      );
      const xToken = await contractFactory.deploy();
      console.log("xToken", xToken.address);

      if (xToken.address) {
        const contractFactory = new ethers.ContractFactory(
          xNftAbi,
          xNftByteCode,
          signer
        );
        const xNft = await contractFactory.deploy();
        console.log("xNft", xNft.address);

        if (xNft.address) {
          const contractFactory = new ethers.ContractFactory(
            marketplaceAbi,
            marketplaceByteCode,
            signer
          );
          const marketplace = await contractFactory.deploy(xToken.address, [
            xNft.address,
          ]);
          console.log("marketplace", marketplace.address);

          if (marketplace.address) {
            navigate(`${marketplace.address}/market`, { replace: false });
          }
        }
      }
      setDeploying(false);
    }
  };

  return (
    <>
      {address && (
        <Button
          onClick={toggleDrawer(true)}
          variant={"outlined"}
          color={"secondary"}
        >
          Create My Marketplace
        </Button>
      )}

      <Box display="flex" justifyContent="center" marginTop="2rem">
        <ConnectButton
          chainStatus="none"
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
          label="Create My Marketplace"
        />
      </Box>

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

            <FormControl fullWidth sx={{ m: 2 }} variant="standard">
              <TextField
                id="outlined-read-only-input"
                label="Contract"
                multiline
                rows={10}
                defaultValue={`
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

pragma solidity ^0.8.4;

contract Marketplace {
    address public owner;
    IERC20 public xToken;

    constructor(address _xTokenAddress, address[] memory _allowedNftAddresses) {
        owner = msg.sender;
        xToken = IERC20(_xTokenAddress);

        for (uint256 i = 0; i < _allowedNftAddresses.length; i++) {
            allowNftAddress(_allowedNftAddresses[i]);
        }
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can do that");
        _;
    }

    event Market(
        address tokenAddress,
        uint256 tokenId,
        address seller,
        uint256 price
    );

    event CancelMarket(address tokenAddress, uint256 tokenId, address seller);

    event Trade(
        address tokenAddress,
        uint256 tokenId,
        address seller,
        uint256 price
    );

    address[] public allowedNftAddresses;

    function getAllowedNftAddressesLength() public view returns (uint256) {
        return allowedNftAddresses.length;
    }

    mapping(address => bool) public allowedNftAddressMap;

    function allowNftAddress(address nftAddress) public onlyOwner {
        require(!allowedNftAddressMap[nftAddress], "Already allowed address");
        allowedNftAddressMap[nftAddress] = true;
        allowedNftAddresses.push(nftAddress);
    }

    mapping(uint256 => uint256) public listingIndices;

    mapping(uint256 => bool) public listingTokenIds;

    struct Listing {
        uint256 id;
        address tokenAddress;
        uint256 tokenId;
        address seller;
        uint256 price;
    }
    // Starts from 1 to protect Invalid Listing require (default uint value 0)
    uint256 private nextListingId = 1;

    Listing[] public listings;

    function getListingsLength() public view returns (uint256) {
        return listings.length;
    }

    function market(
        address tokenAddress,
        uint256 tokenId,
        uint256 price
    ) public {
        require(allowedNftAddressMap[tokenAddress], "Not allowed nft address");
        require(price != 0, "Cannot sell for nothing");
        uint256 listingId = nextListingId++;
        Listing memory listing = Listing(
            listingId,
            tokenAddress,
            tokenId,
            msg.sender,
            price
        );
        listings.push(listing);
        listingIndices[listingId] = listings.length - 1;

        listingTokenIds[tokenId] = true;

        emit Market(tokenAddress, tokenId, msg.sender, price);
    }

    function cancelMarket(uint256 listingId) public {
        uint256 index = listingIndices[listingId];
        Listing storage listing = listings[index];

        require(listing.seller == msg.sender, "Only seller can cancel");

        listingTokenIds[listing.tokenId] = false;

        Listing storage lastListing = listings[listings.length - 1];
        listingIndices[lastListing.id] = index;
        listings[index] = lastListing;
        listings.pop();
        delete listingIndices[listingId];

        emit CancelMarket(listing.tokenAddress, listing.tokenId, msg.sender);
    }

    function buy(uint256 listingId) public {
        uint256 index = listingIndices[listingId];
        Listing storage listing = listings[index];
        require(listing.id == listingId, "Invalid listing");
        require(
            xToken.transferFrom(msg.sender, listing.seller, listing.price),
            "Could not send X tokens"
        );

        IERC721 xNft = IERC721(listing.tokenAddress);
        xNft.safeTransferFrom(listing.seller, msg.sender, listing.tokenId);

        listingTokenIds[listing.tokenId] = false;

        Listing storage lastListing = listings[listings.length - 1];
        listingIndices[lastListing.id] = index;
        listings[index] = lastListing;
        listings.pop();
        delete listingIndices[listingId];

        emit Trade(
            listing.tokenAddress,
            listing.tokenId,
            listing.seller,
            listing.price
        );
    }

    function getListingById(uint256 listingId)
        public
        view
        returns (Listing memory)
    {
        uint256 listing = listingIndices[listingId];
        return listings[listing];
    }
}
                `}
                InputProps={{
                  readOnly: true,
                }}
                // variant="standard"
              />
            </FormControl>

            {/* <Box
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
            </Box> */}

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
