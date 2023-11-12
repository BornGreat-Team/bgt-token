// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SignatureChecker {
    struct Sign {
        bytes32 r;
        bytes32 s;
        uint8 v;
    }
    address internal _signature;

    constructor() {}

    function _isVerifiedSign(
        bytes32 digest,
        Sign memory sign
    ) internal view returns (bool) {
        address signer = ecrecover(digest, sign.v, sign.r, sign.s);
        require(signer != address(0), "ECDSA: invalid signature");
        return signer == _signature;
    }

    function _createMessageDigest(
        address allowedAddress,
        address contractAddress,
        uint256 price,
        uint256[] memory itemId,
        string[] memory uri
    ) internal pure returns (bytes32) {
        // Concatenate all the URI strings into a single string
        string memory concatenatedUri = "";
        for (uint256 i = 0; i < uri.length; i++) {
            concatenatedUri = string(abi.encodePacked(concatenatedUri, uri[i]));
        }

        // Hash the concatenated data
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    keccak256(
                        abi.encodePacked(
                            allowedAddress,
                            contractAddress,
                            price,
                            itemId,
                            concatenatedUri
                        )
                    )
                )
            );
    }

    modifier checker(
        Sign memory sign,
        uint256 price,
        uint256[] memory itemId,
        string[] memory uri
    ) {
        require(
            _isVerifiedSign(
                _createMessageDigest(
                    msg.sender,
                    address(this),
                    price,
                    itemId,
                    uri
                ),
                sign
            ),
            "Invalid Signature"
        );
        _;
    }

    function _changeSigner(address newSigner) internal {
        _signature = newSigner;
    }
}
