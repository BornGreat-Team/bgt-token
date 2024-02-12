pragma solidity ^0.8.21;
interface IBGToken {    
    function mint(address to, uint256 amount) external;
}

pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
contract BGTMinter is Ownable {
    using SafeMath for uint256;

    IBGToken public token; 
    uint256 public releaseWindow;
    uint256 public releaseTime;
    uint256 public monthlyLimit;
    uint256 public mintedInMonth;
    uint256 public increaseTime;
    constructor(
        address initialOwner,
        address _token,
        uint256 _releaseTime,
        uint256 _monthlyLimit
    ) Ownable(initialOwner) {
        require(_token != address(0), "Token address cannot be zero");
        require(_monthlyLimit > 0, "Monthly limit must be greater than zero");
        token = IBGToken(_token);
        releaseWindow = _releaseTime;
        releaseTime = block.timestamp+_releaseTime;
        monthlyLimit = _monthlyLimit;
        mintedInMonth = 0;
        increaseTime = block.timestamp+30 days;
    }

    event MinterMint(address indexed to, uint256 amount, uint256 mintedInMonth, uint256 releaseTime);
    event UpdateReleaseTime(uint256 oldReleaseTime, uint256 newReleaseTime);
    event UpdateMonthlyLimit(uint256 oldMonthlyLimit, uint256 newMonthlyLimit);


    function mint(address to,uint256 amount) public onlyOwner {
        require(block.timestamp >= releaseTime, "Release time has not arrived yet");

        if(block.timestamp > increaseTime) 
        {
            mintedInMonth = 0;
            increaseTime = block.timestamp + 30 days;
        }

        require(mintedInMonth + amount <= monthlyLimit, "Monthly limit reached");
        IBGToken(token).mint(to, amount);
        mintedInMonth+=amount;
        releaseTime = block.timestamp + releaseWindow; 
        emit MinterMint(to, amount,mintedInMonth, releaseTime);
    }
  
     function updateReleaseTime(uint256 newTime) external onlyOwner{
        require(newTime != 0, "Time cannot be zero");
        emit UpdateReleaseTime(releaseTime, newTime);
        releaseWindow = newTime;

    }
    function updateMonthlyLimit(uint256 newLimit) external onlyOwner{
        require(newLimit != 0, "Limit cannot be zero");
        emit UpdateMonthlyLimit(monthlyLimit, newLimit);
        monthlyLimit = newLimit;
    }

    function getmintedInMonth() public view returns(uint256){
        return mintedInMonth;
    }
}