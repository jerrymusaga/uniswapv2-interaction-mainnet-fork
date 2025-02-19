import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const DAIAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const UNIFactory = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

  const theAddressIFoundWithUSDCAndDAI =
    "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  const getFactory = await ethers.getContractAt(
    "IUniswapV2Factory",
    UNIFactory
  );
  const uniswapContract = await ethers.getContractAt(
    "IUniswapV2Router02",
    UNIRouter
  );

  let deadline = (await helpers.time.latest()) + 300;

  await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
  const impersonatedSigner = await ethers.getSigner(
    theAddressIFoundWithUSDCAndDAI
  );

  const swapAmount = ethers.parseUnits("4000", 6);
  const minOutputAmount = ethers.parseUnits("990", 18);

  const usdcContract = await ethers.getContractAt("IERC20", USDCAddress);
  const daiContract = await ethers.getContractAt("IERC20", DAIAddress);

  const usdcBalance = await usdcContract.balanceOf(impersonatedSigner.address);
  const daiBalance = await daiContract.balanceOf(impersonatedSigner.address);

  console.log("Initial USDC balance:", ethers.formatUnits(usdcBalance, 6));
  console.log("Initial DAI balance:", ethers.formatUnits(daiBalance, 18));

  usdcContract.connect(impersonatedSigner).approve(UNIRouter, swapAmount);
  uniswapContract
    .connect(impersonatedSigner)
    .swapExactTokensForTokens(
      swapAmount,
      minOutputAmount,
      [USDCAddress, DAIAddress],
      impersonatedSigner.address,
      deadline
    );

  console.log("Final USDC balance:", ethers.formatUnits(usdcBalance, 6));
  console.log("Final DAI balance:", ethers.formatUnits(daiBalance, 18));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
