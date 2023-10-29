// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.21;

import "./utils/signature.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BGTPayment is SignatureChecker,Ownable {

    address public treasuryWallet;
    IERC20 public token;

    constructor(
        address _token,
        address _treasuryWallet
    ){ 
        token = IERC20(_token);
        treasuryWallet = _treasuryWallet;
    }
    event TreasuryChanged(
        address indexed oldTreasury,
        address indexed newTreasury
    );

    event Purchase(
        address indexed to,
        uint256 price,
        uint256[] items
    );

    event SignerChanged(address indexed oldSigner, address indexed newSigner);

    function purchase(
        Sign memory sign,
        uint256 price,
        uint256[] memory itemIds
    ) public checker(sign, price, itemIds) {
        require(token.balanceOf(msg.sender) >= price);
        require(itemIds.length > 0);
        token.transferFrom(msg.sender, treasuryWallet, price);
        emit Purchase(msg.sender,price,itemIds);
    }

    function changeSigner(address newSigner) public onlyOwner {
        emit SignerChanged(_signature, newSigner);
        _changeSigner(newSigner);
    }

    function setTreasuryWallet(address _treasury) public onlyOwner {
        require(_treasury != address(0));
        emit TreasuryChanged(treasuryWallet, _treasury);
        treasuryWallet = _treasury;
    }
}
