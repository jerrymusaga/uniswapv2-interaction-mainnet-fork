import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const main = async () => {
  const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  const UNIRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

  const theAddressIFoundWithUSDCAndDAI =
    "0xf584f8728b874a6a5c7a8d4d387c9aae9172d621";

  const uniswapContract = await ethers.getContractAt(
    "IUniswapV2Router02",
    UNIRouter
  );

  let deadline = (await helpers.time.latest()) + 300;

  await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
  const impersonatedSigner = await ethers.getSigner(
    theAddressIFoundWithUSDCAndDAI
  );

  const ethAmount = ethers.parseUnits("1000", 18);
  const minTokens = ethers.parseUnits("1250", 6);

  const ethBalance = await ethers.provider.getBalance(
    impersonatedSigner.address
  );
  console.log("Initial ETH balance:", ethers.formatEther(ethBalance));

  uniswapContract
    .connect(impersonatedSigner)
    .swapExactETHForTokens(
      minTokens,
      [WETHAddress, USDCAddress],
      impersonatedSigner.address,
      deadline,
      { value: ethAmount }
    );
  console.log("Final ETH balance:", ethers.formatEther(ethBalance));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
