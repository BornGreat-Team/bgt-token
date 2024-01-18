//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BGTToken is ERC20, ERC20Pausable, Ownable,ERC20Burnable {
    constructor(address initialOwner) ERC20("BornGreat", "BGT") Ownable(initialOwner) {
        _mint(msg.sender, 125000000 * 10 ** decimals());
        mintLimit = 1000000000 * 10 ** decimals();
        totalMinted = 125000000 * 10 ** decimals();
    }
    
    event Mint(address indexed to, uint256 amount);
    event MintLimitIncreased(uint256 newLimit);
    event TokensBurned(address indexed burner, uint256 value);
    event ChangeAllowAddress(address indexed oldAllowed, address indexed newAllowed);

    address public allow;        
    uint256 public mintLimit;
    uint256 public totalMinted;

 

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
        emit Mint(to, amount);
    }
    
      function burn(uint256 value) public override whenNotPaused{
        super.burn(value);
        totalMinted -= value;
        emit TokensBurned(msg.sender, value);        
    }

    function burnFrom(address account, uint256 amount) public override whenNotPaused{
        super.burnFrom(account,amount);
        totalMinted -= amount;
        emit TokensBurned(account, amount);
    }
  function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
      
    function allowAddress (address addressToAllow) public onlyOwner{
        emit ChangeAllowAddress(allow,addressToAllow);
        allow = addressToAllow;

    }
   function increaseMintLimit() public onlyOwner{
        mintLimit = 2000000000 * 10 ** decimals();
        emit MintLimitIncreased(mintLimit);
    } 
}
