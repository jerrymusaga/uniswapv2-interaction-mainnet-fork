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
  const getRouter = await ethers.getContractAt("IUniswapV2Router02", UNIRouter);

  const getPairToRemoveFromLiquidity = await getFactory.getPair(
    USDCAddress,
    DAIAddress
  );
  console.log("USDC-DAI address of the pair", getPairToRemoveFromLiquidity);

  let deadline = (await helpers.time.latest()) + 300;

  await helpers.impersonateAccount(theAddressIFoundWithUSDCAndDAI);
  const impersonatedSigner = await ethers.getSigner(
    theAddressIFoundWithUSDCAndDAI
  );

  const lpToken = await ethers.getContractAt(
    "IERC20",
    getPairToRemoveFromLiquidity
  );
  const lpTokenBalance = await lpToken.balanceOf(impersonatedSigner.address);
  console.log(
    "Initial LP token balance",
    ethers.formatUnits(lpTokenBalance, 18)
  );

  if (lpTokenBalance > 0) {
    const liquidityAmountToRemove = lpTokenBalance / 2n;

    const minDai = ethers.parseUnits("1", 18);
    const minUSDC = ethers.parseUnits("1", 6);

    await lpToken
      .connect(impersonatedSigner)
      .approve(getRouter, liquidityAmountToRemove);

    await getRouter.removeLiquidity(
      USDCAddress,
      DAIAddress,
      liquidityAmountToRemove,
      minUSDC,
      minDai,
      impersonatedSigner.address,
      deadline
    );
    const finalLpBalance = await lpToken.balanceOf(impersonatedSigner.address);
    console.log(
      "Final LP Token Balance:",
      ethers.formatUnits(finalLpBalance, 18)
    );
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
