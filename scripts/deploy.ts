import { ethers } from "hardhat";

async function main() {
  const accounts = await ethers.provider.listAccounts();
  const chainId = (await ethers.provider.getNetwork()).chainId;

  console.log("chainId: ", chainId);

  const waitConfirmations = chainId === 1337 ? 0 : 6;

  // XToken

  const XToken = await ethers.getContractFactory("XToken");
  const xToken = await XToken.deploy();

  await xToken.deployed();

  console.log("xToken deployed to:", xToken.address);

  // XNft

  const XNft = await ethers.getContractFactory("XNft");
  const xNft = await XNft.deploy();

  await xNft.deployed();

  console.log("xNft deployed to:", xNft.address);

  // balanceOf

  const balanceOf = await xNft.balanceOf(accounts[0]);

  console.log("balance of", Number(balanceOf));

  // Marketplace

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(xToken.address, [xNft.address]);

  await marketplace.deployed();

  console.log("Marketplace deployed to:", marketplace.address);

  // market1
  (await xNft.approve(marketplace.address, 0)).wait(waitConfirmations);

  // market2
  (await xNft.approve(marketplace.address, 1)).wait(waitConfirmations);

  // market3
  (await xNft.approve(marketplace.address, 2)).wait(waitConfirmations);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
