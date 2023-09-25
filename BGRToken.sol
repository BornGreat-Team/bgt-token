pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BornGreat is ERC20, Pausable, Ownable {
    constructor() ERC20("BornGreat", "BGT") {
        _mint(msg.sender, 125000000 * 10 ** decimals());
    }
    address public allow;    

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == allow, "Not allowed to mint");
        _mint(to, amount);
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