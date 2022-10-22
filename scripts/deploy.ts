import { ethers } from "hardhat";

async function main() {
  //XToken
  const XToken = await ethers.getContractFactory("XToken");
  const xToken = await XToken.deploy();

  await xToken.deployed();

  console.log("xToken deployed to:", xToken.address);

  //XNft

  const XNft = await ethers.getContractFactory("XNft");
  const xNft = await XNft.deploy();

  await xNft.deployed();

  console.log("xNft deployed to:", xNft.address);

  const safeMint1 = xNft.safeMint(
    "0x7292fe48e6685f5b6409963a34345C430EE4129b",
    "Test1"
  );
  (await safeMint1).wait;
  console.log("Minted 1");

  const safeMint2 = xNft.safeMint(
    "0x7292fe48e6685f5b6409963a34345C430EE4129b",
    "Test2"
  );
  (await safeMint2).wait;
  console.log("Minted 2");

  const safeMint3 = xNft.safeMint(
    "0x7292fe48e6685f5b6409963a34345C430EE4129b",
    "Test3"
  );
  (await safeMint3).wait;
  console.log("Minted 3");

  //Marketplace

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(xToken.address, [xNft.address]);

  await marketplace.deployed();

  console.log("Marketplace deployed to:", marketplace.address);

  const market1 = marketplace.market(
    xNft.address,
    0,
    ethers.utils.parseUnits("1", "ether")
  );
  (await market1).wait;
  console.log("Listed 1");

  const market2 = marketplace.market(
    xNft.address,
    1,
    ethers.utils.parseUnits("2", "ether")
  );
  (await market2).wait;
  console.log("Listed 2");

  const market3 = marketplace.market(
    xNft.address,
    2,
    ethers.utils.parseUnits("3", "ether")
  );
  (await market3).wait;
  console.log("Listed 3");

  // Allow marketplace to send NFT
  (await xNft.approve(marketplace.address, 0)).wait;
  (await xNft.approve(marketplace.address, 1)).wait;
  (await xNft.approve(marketplace.address, 2)).wait;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
