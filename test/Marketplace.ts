import { Marketplace, XNft, XToken } from "../typechain-types";

import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";

let marketplace: Marketplace;
let xToken: XToken;
let xNft: XNft;
let accounts: SignerWithAddress[];

describe("Marketplace contract test", () => {
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

  it("Should market nft", async () => {
    await (
      await marketplace.market(xNft.address, 0, "1000000000000000000")
    ).wait();
    const marketCheck1 = await marketplace.listings(0);

    expect(marketCheck1.id).to.equal(1);
    expect(marketCheck1.price).to.equal(BigNumber.from("1000000000000000000"));
    expect(marketCheck1.seller).to.equal(accounts[0].address);
    expect(marketCheck1.tokenAddress).to.equal(xNft.address);
  });

  it("Should cancel market nft", async () => {
    await (await marketplace.cancelMarket(0)).wait();
    try {
      await marketplace.listings(0);
    } catch (e: any) {
      expect(e.code).to.equal("CALL_EXCEPTION");
    }
  });
});
