// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.19;

import "./utils/signature.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract BGTPayment is ERC721, ERC721URIStorage, SignatureChecker, Ownable {
    string private baseURI;
    address public treasuryWallet;
    IERC20 public token;

    constructor(
        string memory _name,
        string memory _symbol,
        address _minter,
        address _token,
        address _treasuryWallet
    ) ERC721(_name, _symbol) {
        token = IERC20(_token);
        treasuryWallet = _treasuryWallet;
        _signature = _minter;
    }

    event BaseURIChanged(
        string indexed oldBaserURI,
        string indexed newBaserURI
    );

    event TreasuryChanged(
        address indexed oldTreasury,
        address indexed newTreasury
    );

    event Purchase(address indexed to, uint256 price, uint256[] items);

    event SignerChanged(address indexed oldSigner, address indexed newSigner);

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _burn(
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function purchase(
        Sign memory sign,
        uint256 price,
        uint256[] memory itemIds,
        string[] memory uris
    ) public checker(sign, price, itemIds, uris) {
        require(token.balanceOf(msg.sender) >= price, "Not enough balance");
        require(
            itemIds.length > 0 && itemIds.length == uris.length,
            "Length Mismatch"
        );
        token.transferFrom(msg.sender, treasuryWallet, price);
        for (uint i = 0; i < itemIds.length; i++) {
            _safeMint(msg.sender, itemIds[i]);
            _setTokenURI(itemIds[i], uris[i]);
        }
        emit Purchase(msg.sender, price, itemIds);
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
