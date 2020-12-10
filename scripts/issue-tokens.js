const EnergyPharm = artifacts.require('EnergyPharm');

module.exports = async function(callback) {
  //code goes here 
  
  let energyPharm = await EnergyPharm.deployed();
  await energyPharm.issueTokens();
  console.log("Tokens Issued!");


  callback();

}

//run truffle exec scripts/issue-tokens.js