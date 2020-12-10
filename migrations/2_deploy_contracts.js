const EnergyPharm = artifacts.require("EnergyPharm.sol");
const DaiToken = artifacts.require("DaiToken.sol");
const EnergyToken = artifacts.require("EnergyToken.sol");

module.exports = async function(deployer, _network, accounts) {
  
  // Deploy Mock DAI Token
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()
 

  //Deploy EnergyToken
  await deployer.deploy(EnergyToken)
  const energyToken = await EnergyToken.deployed()
  

  //Deploy EnergyPharm
  await deployer.deploy(EnergyPharm, energyToken.address, daiToken.address);
  const energyPharm = await EnergyPharm.deployed();

 //transfer all tokens to EnergyPharm (1million)
 await energyToken.transfer(energyPharm.address, web3.utils.toWei('1000000'));
  //transfer dai tokens to investor accounts[1] 100 energy
  await daiToken.transfer(accounts[1], web3.utils.toWei('100'));
};
