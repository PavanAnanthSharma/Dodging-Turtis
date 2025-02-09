const Turtis = artifacts.require("Turtis");
const TurtisMarket = artifacts.require("TurtisMarket");

module.exports = async (deployer) => {
  await deployer.deploy(TurtisMarket);
  let turtisMarket = await TurtisMarket.deployed();
  await deployer.deploy(Turtis, turtisMarket.address);
  let turtis = await Turtis.deployed();
};
