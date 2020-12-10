import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import EnergyToken from '../abis/EnergyToken.json'
import EnergyPharm from '../abis/EnergyPharm.json'
import Navbar from './Navbar'
import './App.css'
import BankUI from './BankUI';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()

    // Load DaiToken.sol
    const daiTokenData = DaiToken.networks[networkId]
    if(daiTokenData) {
      const daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({ daiToken })
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
    } else {
      window.alert('DaiToken contract not deployed to detected network.')
    }

    // Load EnergyToken.sol
    const energyTokenData = EnergyToken.networks[networkId]
    if(energyTokenData) {
      const energyToken= new web3.eth.Contract(EnergyToken.abi, energyTokenData.address)
      this.setState({ energyToken })
      let energyTokenBalance = await energyToken.methods.balanceOf(this.state.account).call()
      this.setState({ energyTokenBalance: energyTokenBalance.toString() })
    } else {
      window.alert('energyToken contract not deployed to detected network.')
    }

    // Load EnergyPharm.sol
    const energyPharmData = EnergyPharm.networks[networkId]
    if(energyPharmData) {
      const energyPharm = new web3.eth.Contract(EnergyPharm.abi, energyPharmData.address)
      this.setState({ energyPharm })
      let stakingBalance = await energyPharm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
    } else {
      window.alert('energyPharm contract not deployed to detected network.')
    }
    console.log(this.state.account);
    console.log(this.state.daiToken);
    console.log(this.state.stakingBalance);
   
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.daiToken.methods.approve(this.state.energyPharm.address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.energyPharm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }
  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.energyPharm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      energyToken: {},
      energyPharm: {},
      daiTokenBalance: '0',
      energyTokenBalance: '0',
      stakingBalance: '0',
      loading: false
    }
  }

  render() {
    let content 
    if(this.state.loading) {
      content= <p>Loading...</p>
    } else {
      content = <BankUI
      daiTokenBalance={this.state.daiTokenBalance}
      energyTokenBalance={this.state.energyTokenBalance}
      stakingBalance={this.state.stakingBalance}
      stakeTokens={this.stakeTokens}
      unstakeTokens={this.unstakeTokens}
      />
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                    {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
