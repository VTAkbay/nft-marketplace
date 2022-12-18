import { Marketplace, XNft, XToken } from "../typechain-types";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";

let marketplace: Marketplace;
let xToken: XToken;
let xNft: XNft;
let accounts: SignerWithAddress[];

describe("XNft contract test", () => {
  before(async () => {
    accounts = await ethers.getSigners();

    const xTokenContract = await ethers.getContractFactory("XToken");
    xToken = await xTokenContract.deploy();

    await xToken.deployed();

    const xNftContract = await ethers.getContractFactory("XNft");
    xNft = await xNftContract.deploy();

    await xNft.deployed();

    const marketplaceContract = await ethers.getContractFactory("Marketplace");
    marketplace = await marketplaceContract.deploy(xToken.address, [
      xNft.address,
    ]);

    await marketplace.deployed();
  });

  it("Should mint nfts", async () => {
    const safeMint1 = await xNft.safeMint(accounts[0].address, "Test1");
    await safeMint1.wait();
    const checkMint1 = await xNft.tokenURI(0);
    expect(checkMint1).to.equal("Test1");

    const safeMint2 = await xNft.safeMint(accounts[0].address, "Test2");
    await safeMint2.wait();
    const checkMint2 = await xNft.tokenURI(1);
    expect(checkMint2).to.equal("Test2");

    const safeMint3 = await xNft.safeMint(accounts[0].address, "Test3");
    await safeMint3.wait();
    const checkMint3 = await xNft.tokenURI(2);
    expect(checkMint3).to.equal("Test3");
  });

  it("Should approve to nfts", async () => {
    await (await xNft.approve(marketplace.address, 0)).wait();
    const checkApprove1 = await xNft.getApproved(0);
    expect(checkApprove1).to.equal(marketplace.address);

    await (await xNft.approve(marketplace.address, 1)).wait();
    const checkApprove2 = await xNft.getApproved(1);
    expect(checkApprove2).to.equal(marketplace.address);

    await (await xNft.approve(marketplace.address, 2)).wait();
    const checkApprove3 = await xNft.getApproved(2);
    expect(checkApprove3).to.equal(marketplace.address);
  });

  it("Should transfer nfts", async () => {
    await (
      await xNft.transferFrom(accounts[0].address, accounts[1].address, 0)
    ).wait();
    const checkTransfer1 = await xNft.ownerOf(0);
    expect(checkTransfer1).to.equal(accounts[1].address);

    await (
      await xNft.transferFrom(accounts[0].address, accounts[1].address, 1)
    ).wait();
    const checkTransfer2 = await xNft.ownerOf(1);
    expect(checkTransfer2).to.equal(accounts[1].address);

    await (
      await xNft.transferFrom(accounts[0].address, accounts[1].address, 2)
    ).wait();
    const checkTransfer3 = await xNft.ownerOf(2);
    expect(checkTransfer3).to.equal(accounts[1].address);
  });
});
