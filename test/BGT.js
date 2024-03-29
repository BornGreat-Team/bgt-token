const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("BGTToken", function () {
    let bgtToken;
    let owner;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        const BGTToken = await ethers.getContractFactory("BGTToken");
        bgtToken = await BGTToken.deploy(
            owner
        );
        await bgtToken.deployed();


        await bgtToken.allowAddress(owner.address);
    });

    it("Should deploy successfully", async function () {
        expect(await bgtToken.name()).to.equal("BornGreat");
        expect(await bgtToken.symbol()).to.equal("BGT");
    });

    it("Should mint tokens", async function () {
        const preMinted = 125000000;
        await bgtToken.mint(owner.address, ethers.utils.parseUnits("1000", "ether"));

        const totalMintedToken = preMinted + 1000;

        expect(await bgtToken.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits(String(totalMintedToken), "ether"));
    });

    it("Should burn tokens", async function () {
        const preMinted = 125000000;
        await bgtToken.burn(ethers.utils.parseUnits("500", "ether"));

        const totalRemainingToken = preMinted - 500;

        expect(await bgtToken.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits(String(totalRemainingToken), "ether"));
    });

    it("Should pause and unpause", async function () {
        await bgtToken.pause();
        expect(await bgtToken.paused()).to.equal(true);

        await bgtToken.connect(owner).unpause();
        expect(await bgtToken.paused()).to.equal(false);
    });

    it("Should increase mint limit", async function () {
        expect(await bgtToken.mintLimit()).to.equal(ethers.utils.parseUnits("1000000000", "ether"));

        await bgtToken.connect(owner).increaseMintLimit();
        expect(await bgtToken.mintLimit()).to.equal(ethers.utils.parseUnits("2000000000", "ether"));
    });
});

describe("BGTMinter", function () {
    let bgtToken;
    let bgtMinter;
    let owner;
    let addr1 = "0x5FbDB2315678afecb367f032d93F642f64180aa3";


    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        const BGTToken = await ethers.getContractFactory("BGTToken");
        bgtToken = await BGTToken.deploy(
            owner
        );
        await bgtToken.deployed();
        const BGTMinter = await ethers.getContractFactory("BGTMinter");
        bgtMinter = await BGTMinter.deploy(
            owner,
            bgtToken.address,
            1,
            ethers.utils.parseUnits("1000", "ether")
        );


        await bgtToken.allowAddress(bgtMinter.address);
    });

    it("Should deploy successfully", async function () {
        expect(await bgtMinter.releaseWindow()).to.equal(1);
        expect(await bgtMinter.monthlyLimit()).to.equal(ethers.utils.parseUnits("1000", "ether"));
        expect(await bgtMinter.mintedThisMonth()).to.equal(0);
    });

    it("Should mint after the time has passed", async function () {
        expect(await bgtMinter.connect(owner).mint(addr1, ethers.utils.parseUnits("500", "ether"))).to.emit(bgtMinter, "TokensMinted").withArgs(addr1, ethers.utils.parseUnits("500", "ether"));
    });

    it("Should not mint if the time has not passed", async function () {        
        const BGTMinter = await ethers.getContractFactory("BGTMinter");
        const bgtMinter = await BGTMinter.deploy(
            bgtToken.address,
            3600, // 1 hour
            ethers.utils.parseUnits("1000", "ether")
        );
        await bgtToken.allowAddress(bgtMinter.address);
        await expect(bgtMinter.connect(owner).mint(addr1, ethers.utils.parseUnits("500", "ether"))).to.be.revertedWith("Release time has not arrived yet");
    });

    it("Should not mint if the monthly limit is reached", async function () {        
        const BGTMinter = await ethers.getContractFactory("BGTMinter");
        const bgtMinter = await BGTMinter.deploy(
            bgtToken.address,
            1,
            ethers.utils.parseUnits("500", "ether") // Monthly limit of 500 BGT
        );
    
        await bgtToken.allowAddress(bgtMinter.address);
        await bgtMinter.connect(owner).mint(addr1, ethers.utils.parseUnits("500", "ether"));
        await expect(bgtMinter.connect(owner).mint(addr1, ethers.utils.parseUnits("1", "ether"))).to.be.revertedWith("Monthly limit reached");

    });

    it("Should update release time", async function () {
        expect(await bgtMinter.releaseWindow()).to.equal(1);
        await bgtMinter.updateReleaseTime(7); // 7 seconds
        expect(await bgtMinter.releaseWindow()).to.equal(7);
    });

    it("Should update monthly limit", async function () {
        expect(await bgtMinter.monthlyLimit()).to.equal(ethers.utils.parseUnits("1000", "ether"));

        await bgtMinter.updateMonthlyLimit(ethers.utils.parseUnits("2000", "ether"));
        expect(await bgtMinter.monthlyLimit()).to.equal(ethers.utils.parseUnits("2000", "ether"));
    });

    it("Should not mint if the token allowance is not set", async function () {
        
        const BGTMinter = await ethers.getContractFactory("BGTMinter");
        const bgtMinter = await BGTMinter.deploy(
            bgtToken.address,
            1,
            ethers.utils.parseUnits("1000", "ether")
        );    
        await expect(bgtMinter.connect(owner).mint(addr1, ethers.utils.parseUnits("500", "ether"))).to.be.revertedWith("Not allowed to mint");
    });
});
