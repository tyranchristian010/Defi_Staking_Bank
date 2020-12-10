pragma solidity ^0.5.0;

import "./EnergyToken.sol";
import "./DaiToken.sol";

contract EnergyPharm {
    string public name = "Energy Token Farm";
    address public deployer;
    EnergyToken public energyToken;
    DaiToken public daiToken;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(EnergyToken _energyToken, DaiToken _daiToken) public {
        energyToken = _energyToken;
        daiToken = _daiToken;
        deployer = msg.sender;
    }

    function stakeTokens(uint _amount) public {
        // Require amount greater than 0
        require(_amount > 0, "amount cannot be 0");

        // Trasnfer Mock Dai tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // Update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        // Add user to stakers array *only* if they haven't staked already
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }
    //unstake tokens
    function unstakeTokens() public {
      uint balance = stakingBalance[msg.sender];
      require(balance>0);
      // Trasnfer Mock Dai tokens to the investor for 
        daiToken.transfer(msg.sender, balance);

        // Update staking balance
        stakingBalance[msg.sender] = 0;

        // Update staking status
        isStaking[msg.sender] = false;
    }

    // Issue Tokens to stakers
    function issueTokens() public {
        // Only deployer can call this function
        require(msg.sender == deployer, "caller must be the owner");

        // Issue tokens to all stakers
        for (uint i=0; i<stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0) {
                energyToken.transfer(recipient, balance);
            }
        }
    }
}

 
