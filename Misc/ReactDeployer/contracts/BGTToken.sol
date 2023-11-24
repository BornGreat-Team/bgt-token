//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BGTToken is ERC20, Pausable, Ownable,ERC20Burnable {
    constructor() ERC20("BornGreat", "BGT") {
        _mint(msg.sender, 125000000 * 10 ** decimals());
        mintLimit = 1000000000 * 10 ** decimals();
        totalMinted = 125000000 * 10 ** decimals();
    }

    address public allow;        
    uint256 public mintLimit;
    uint256 public totalMinted;

    function increaseMintLimit() public onlyOwner{
        mintLimit = 2000000000 * 10 ** decimals();
    } 

    // modifier limitChecker(){
    //     _;
    //     require(totalMinted <= mintLimit,"Mint limit exceed");
    // }

    modifier isAllowedToMint(){
        require(msg.sender == allow, "Not allowed to mint");
        _;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) whenNotPaused isAllowedToMint external {
        require(totalMinted+amount <= mintLimit, "Mint limit exceeded");
        _mint(to, amount);
        totalMinted += amount;
    }
    
      function burn(uint256 value) public override whenNotPaused{
        super.burn(value);
        totalMinted -= value;        
    }

    function burnFrom(address account, uint256 amount) public override whenNotPaused{
        super.burnFrom(account,amount);
        totalMinted -= amount;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
  
    function allowAddress (address addressToAllow) public onlyOwner{
        allow = addressToAllow;
    }

}