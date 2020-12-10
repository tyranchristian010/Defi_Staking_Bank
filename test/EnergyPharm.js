const DaiToken = artifacts.require('DaiToken')
const EnergyToken = artifacts.require('EnergyToken')
const EnergyPharm = artifacts.require('EnergyPharm')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('EnergyPharm', ([deployer, investor]) => {
  let daiToken, energyToken, energyPharm

  before(async () => {
    // Load Contracts
    daiToken = await DaiToken.new()
    energyToken = await EnergyToken.new()
    energyPharm = await EnergyPharm.new(energyToken.address, daiToken.address)

    // Transfer all Energy tokens to farm (1 million)
    await energyToken.transfer(energyPharm.address, tokens('1000000'))

    // Send tokens to investor
    await daiToken.transfer(investor, tokens('100'), { from: deployer })
  })

  describe('Mock DAI deployment', async () => {
    it('has a name', async () => {
      const name = await daiToken.name()
      assert.equal(name, 'Dai Token')
    })
  })

  describe('Energy Token deployment', async () => {
    it('has a name', async () => {
      const name = await energyToken.name()
      assert.equal(name, 'EnergyToken')
    })
  })

  describe('Token Farm deployment', async () => {
    it('has a name', async () => {
      const name = await energyPharm.name()
      assert.equal(name, 'Energy Token Farm')
    })

    it('contract has tokens', async () => {
      let balance = await energyToken.balanceOf(energyPharm.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })

  describe('Farming tokens', async () => {

    it('rewards investors for staking mDai tokens', async () => {
      let result

      // Check investor balance before staking
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')

      // Stake Mock DAI Tokens
      await daiToken.approve(energyPharm.address, tokens('100'), { from: investor })
      await energyPharm.stakeTokens(tokens('100'), { from: investor })

      // Check staking result
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')

      result = await daiToken.balanceOf(energyPharm.address)
      assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI balance correct after staking')

      result = await energyPharm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

      result = await energyPharm.isStaking(investor)
      assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

      // Issue Tokens
      await energyPharm.issueTokens({ from: deployer })

      // Check balances after issuance
      result = await energyToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'investor Energy Token wallet balance correct affter issuance')

      // Ensure that only deployer can issue tokens
      await energyPharm.issueTokens({ from: investor }).should.be.rejected;
     
      // Withdraw Tokens
      await energyPharm.unstakeTokens({ from: investor })
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('100'), 'Token Farm mDAI balance correct after staking')
      
      result = await daiToken.balanceOf(energyPharm.address)
      assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI balance correct after staking')

      result = await energyPharm.stakingBalance(investor)
      assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

      result = await energyPharm.isStaking(investor)
      assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
    })
  })
})