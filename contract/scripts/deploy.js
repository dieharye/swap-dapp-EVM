// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.
async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );
  console.log("Account balance:", (await deployer.getBalance()).toString());
  const Token = await ethers.getContractFactory("SwapPro");
  //const token = await Token.deploy("0x7a250d5630b4cf539739df2c5dacb4c659f2488d"); //BSC
  const token = await Token.deploy();
  await token.deployed();
  console.log("Token address:", token.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


  //USDT in ropsten 0x110a13FC3efE6A245B50102D2d79B3E76125Ae83, kovan 0x07de306FF27a2B630B1141956844eB1552B956B5