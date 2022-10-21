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

    mapping(uint256 => uint256) public listingIndices;

    struct Listing {
        uint256 id;
        address tokenAddress;
        uint256 tokenId;
        address seller;
        uint256 price;
    }
    uint256 private nextListingId;

    Listing[] public listings;

    function market(
        address tokenAddress,
        uint256 tokenId,
        uint256 price
    ) public {
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
        emit Market(tokenAddress, tokenId, msg.sender, price);
    }

    function cancelMarket(uint256 listingId) public {
        uint256 index = listingIndices[listingId];
        Listing storage listing = listings[index];

        require(listing.seller == msg.sender, "Only seller can cancel");

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
        require(
            xToken.transferFrom(msg.sender, listing.seller, listing.price),
            "Could not send X tokens"
        );

        IERC721 token = IERC721(listing.tokenAddress);
        token.safeTransferFrom(msg.sender, listing.seller, listing.tokenId);

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
