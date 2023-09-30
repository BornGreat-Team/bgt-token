//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;
interface IBGRToken {    
    function mint(address to, uint256 amount) external;
}

pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
contract BGTMinter is Ownable {
    using SafeMath for uint256;

    IBGRToken public token; 
    uint256 public releaseWindow;
    uint256 public releaseTime;
    uint256 public monthlyLimit;
    uint256 public mintedThisMonth;
    uint256 public monthTime;
    constructor(
        address _token,
        uint256 _releaseTime,
        uint256 _monthlyLimit
    ) {
        require(_token != address(0), "Token address cannot be zero");
        require(_monthlyLimit > 0, "Monthly limit must be greater than zero");
        token = IBGRToken(_token);
        releaseWindow = _releaseTime;
        releaseTime = block.timestamp+_releaseTime;
        monthlyLimit = _monthlyLimit;
        mintedThisMonth = 0;
        monthTime = block.timestamp+30 days;
    }
    function mint(address to,uint256 amount) public onlyOwner {
        require(block.timestamp >= releaseTime, "Release time has not arrived yet");

        if(block.timestamp > monthTime) 
        {
            mintedThisMonth = 0;
            monthTime = block.timestamp + 30 days;
        }

        require(mintedThisMonth + amount <= monthlyLimit, "Monthly limit reached");
        IBGRToken(token).mint(to, amount);
        mintedThisMonth+=amount;
        releaseTime = block.timestamp + releaseWindow; 
    }
     function updateReleaseTime(uint256 newTime) external onlyOwner{
        require(newTime != 0, "Time cannot be zero");
        releaseWindow = newTime;
    }
    function updateMonthlyLimit(uint256 newLimit) external onlyOwner{
        require(newLimit != 0, "Limit cannot be zero");
        monthlyLimit = newLimit;
    }

    function getMintedThisMonth() public view returns(uint256){
        return mintedThisMonth;
    }
}