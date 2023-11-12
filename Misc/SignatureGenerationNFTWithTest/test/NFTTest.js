const { expect } = require("chai");
const { ethers } = require("hardhat");

describe.only("BGTPayment Contract", function () {
  let BGTPayment;
  let bgtPayment;
  let owner;
  let signer;
  let user1;
  let user2;
  let token;

  beforeEach(async function () {
    [owner, signer, user1, user2] = await ethers.getSigners();

    // Deploy ERC20 token contract
    const Token = await ethers.getContractFactory("BGTToken"); // Replace with your ERC20 token contract
    token = await Token.deploy();

    // Deploy the BGTPayment contract
    BGTPayment = await ethers.getContractFactory("BGTPayment");
    bgtPayment = await BGTPayment.deploy("NFT Marketplace", "NFT", signer.address, token.address, owner.address);
    await bgtPayment.deployed();
  });

  it("Should have the correct initial values", async function () {
    expect(await bgtPayment.name()).to.equal("NFT Marketplace");
    expect(await bgtPayment.symbol()).to.equal("NFT");
    expect(await bgtPayment.treasuryWallet()).to.equal(owner.address);
  });
  
  it("Should allow a user to purchase NFTs", async function () {
    // Define the purchase details
    const price = ethers.utils.parseEther("50");
    const itemIds = [1, 2];
    const uris = ["asdsa", "asdsaa"];

    // Create the message to sign
    const message = ethers.utils.solidityKeccak256(
      ["address", "address", "uint256", "uint256[]", "string[]"],
      [signer.address, bgtPayment.address, price, itemIds, uris]
    );

    // Sign the message with the signer's private key
    const signature = await signer.signMessage(ethers.utils.arrayify(message));
    const { r, s, v } = ethers.utils.splitSignature(signature);
    const sign = { r, s, v };

    await token.transfer(signer.address, ethers.utils.parseEther("50"))

    // Perform the purchase
    await token.connect(signer).approve(bgtPayment.address, price);
    await bgtPayment.connect(signer).purchase(sign, price, itemIds, uris);

    // Verify that the user owns the NFTs
    for (let i = 0; i < itemIds.length; i++) {
      expect(await bgtPayment.ownerOf(itemIds[i])).to.equal(signer.address);
    }
  });

  it("Should not allow a user to mint same NFT", async function () {
    // Define the purchase details
    const price = ethers.utils.parseEther("50");
    const price2 = ethers.utils.parseEther("100");
    const itemIds = [1, 2];
    const uris = ["asdsa", "asdsaa"];

    // Create the message to sign
    const message = ethers.utils.solidityKeccak256(
      ["address", "address", "uint256", "uint256[]", "string[]"],
      [signer.address, bgtPayment.address, price, itemIds, uris]
    );

    // Sign the message with the signer's private key
    const signature = await signer.signMessage(ethers.utils.arrayify(message));
    const { r, s, v } = ethers.utils.splitSignature(signature);
    const sign = { r, s, v };

    await token.transfer(signer.address, ethers.utils.parseEther("100"))

    // Perform the purchase
    await token.connect(signer).approve(bgtPayment.address, price2);
    await bgtPayment.connect(signer).purchase(sign, price, itemIds, uris);
    await expect( bgtPayment.connect(signer).purchase(sign, price, itemIds, uris)).to.be.revertedWith("ERC721: token already minted");

  });

  it("Should not allow a user to purchase with an invalid signature", async function () {
    const price = ethers.utils.parseEther("2");
    const itemIds = [4, 5];
    const uris = ["uri4", "uri5"];

    // Invalid signature (just random values)
    const sign = {
      r: "0x1111111111111111111111111111111111111111111111111111111111111111",
      s: "0x2222222222222222222222222222222222222222222222222222222222222222",
      v: 27, // v can be 27 or 28 for Ethereum signatures
    };

    await expect(bgtPayment.connect(user1).purchase(sign, price, itemIds, uris)).to.be.revertedWith("ECDSA: invalid signature");
  });

  it("Should revert if user does not have enough token", async function () {
    // Define the purchase details
    const price = ethers.utils.parseEther("50");
    const itemIds = [1, 2];
    const uris = ["asdsa", "asdsaa"];

    const message = ethers.utils.solidityKeccak256(
      ["address", "address", "uint256", "uint256[]", "string[]"],
      [signer.address, bgtPayment.address, price, itemIds, uris]
    );

    // Perform the purchase
    await token.connect(signer).approve(bgtPayment.address, price);
    const signature = await signer.signMessage(ethers.utils.arrayify(message));
    const { r, s, v } = ethers.utils.splitSignature(signature);
    const sign = { r, s, v };

    // Attempt to purchase NFTs with a price higher than the user's balance
    await expect(bgtPayment.connect(signer).purchase(sign, price, itemIds, uris)).to.be.revertedWith("Not enough balance");

    // Ensure the contract balance remains unchanged
    expect(await token.balanceOf(bgtPayment.address)).to.equal(0);
  });

  it("Should revert if user does not approve enough token", async function () {
    // Define the purchase details
    const price = ethers.utils.parseEther("50");
    const itemIds = [1, 2];
    const uris = ["asdsa", "asdsaa"];

    const message = ethers.utils.solidityKeccak256(
      ["address", "address", "uint256", "uint256[]", "string[]"],
      [signer.address, bgtPayment.address, price, itemIds, uris]
    );

    await token.transfer(signer.address, ethers.utils.parseEther("50"))

    // Perform the purchase
    const signature = await signer.signMessage(ethers.utils.arrayify(message));
    const { r, s, v } = ethers.utils.splitSignature(signature);
    const sign = { r, s, v };

    // Attempt to purchase NFTs with a price higher than the user's balance
    await expect(bgtPayment.connect(signer).purchase(sign, price, itemIds, uris)).to.be.revertedWith("ERC20: insufficient allowance");

    // Ensure the contract balance remains unchanged
    expect(await token.balanceOf(bgtPayment.address)).to.equal(0);
  });

  it("Should allow changing the signer", async function () {
    const newSigner = user1.address;
    await expect(bgtPayment.connect(owner).changeSigner(newSigner))
      .to.emit(bgtPayment, "SignerChanged")
      .withArgs(signer.address, newSigner);
  });

  it("Should allow changing the treasury wallet", async function () {
    const newTreasury = user2.address;
    await bgtPayment.connect(owner).setTreasuryWallet(newTreasury);
    expect(await bgtPayment.treasuryWallet()).to.equal(newTreasury);
  });

});
