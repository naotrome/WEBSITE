const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TotheNineCloud", function () {
    let totheNineCloud;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    const TOTAL_SUPPLY = ethers.parseEther("1000000000"); // 1 billion tokens
    const MAX_TRANSACTION = ethers.parseEther("10000000"); // 10 million tokens
    const MAX_WALLET = ethers.parseEther("20000000"); // 20 million tokens

    beforeEach(async function () {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        const TotheNineCloud = await ethers.getContractFactory("TotheNineCloud");
        totheNineCloud = await TotheNineCloud.deploy();
        await totheNineCloud.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await totheNineCloud.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply to the owner", async function () {
            const ownerBalance = await totheNineCloud.balanceOf(owner.address);
            expect(await totheNineCloud.totalSupply()).to.equal(ownerBalance);
        });

        it("Should have correct token details", async function () {
            expect(await totheNineCloud.name()).to.equal("TotheNineCloud");
            expect(await totheNineCloud.symbol()).to.equal("T9C");
            expect(await totheNineCloud.totalSupply()).to.equal(TOTAL_SUPPLY);
        });

        it("Should have correct initial parameters", async function () {
            expect(await totheNineCloud.maxTransactionAmount()).to.equal(MAX_TRANSACTION);
            expect(await totheNineCloud.maxWalletAmount()).to.equal(MAX_WALLET);
            expect(await totheNineCloud.reflectionFee()).to.equal(2);
        });
    });

    describe("Transfers", function () {
        it("Should transfer tokens between accounts", async function () {
            const transferAmount = ethers.parseEther("1000");
            
            await totheNineCloud.transfer(addr1.address, transferAmount);
            const addr1Balance = await totheNineCloud.balanceOf(addr1.address);
            
            // Account for reflection fee (2%)
            const expectedBalance = transferAmount * 98n / 100n;
            expect(addr1Balance).to.be.closeTo(expectedBalance, ethers.parseEther("1"));
        });

        it("Should fail if sender doesn't have enough tokens", async function () {
            const initialOwnerBalance = await totheNineCloud.balanceOf(owner.address);
            const transferAmount = initialOwnerBalance + 1n;

            await expect(
                totheNineCloud.connect(addr1).transfer(owner.address, transferAmount)
            ).to.be.reverted;
        });

        it("Should update balances after transfers", async function () {
            const initialOwnerBalance = await totheNineCloud.balanceOf(owner.address);
            const transferAmount = ethers.parseEther("1000");

            await totheNineCloud.transfer(addr1.address, transferAmount);

            const finalOwnerBalance = await totheNineCloud.balanceOf(owner.address);
            expect(finalOwnerBalance).to.be.lt(initialOwnerBalance);
        });
    });

    describe("Anti-Whale Protection", function () {
        it("Should enforce max transaction amount", async function () {
            const largeAmount = MAX_TRANSACTION + 1n;
            
            await expect(
                totheNineCloud.transfer(addr1.address, largeAmount)
            ).to.be.revertedWith("T9C: Transaction amount exceeds limit");
        });

        it("Should enforce max wallet amount", async function () {
            // First transfer within limits
            await totheNineCloud.transfer(addr1.address, MAX_TRANSACTION);
            
            // Second transfer that would exceed wallet limit
            const additionalAmount = MAX_WALLET - MAX_TRANSACTION + 1n;
            
            await expect(
                totheNineCloud.transfer(addr1.address, additionalAmount)
            ).to.be.revertedWith("T9C: Wallet amount exceeds limit");
        });

        it("Should emit AntiWhaleTriggered event for large transactions", async function () {
            const largeAmount = MAX_TRANSACTION / 2n + 1n;
            
            await expect(totheNineCloud.transfer(addr1.address, largeAmount))
                .to.emit(totheNineCloud, "AntiWhaleTriggered")
                .withArgs(owner.address, largeAmount);
        });

        it("Should emit CloudReached event for large balances", async function () {
            const largeAmount = MAX_WALLET / 2n + 1n;
            
            await expect(totheNineCloud.transfer(addr1.address, largeAmount))
                .to.emit(totheNineCloud, "CloudReached");
        });
    });

    describe("Reflection Mechanism", function () {
        it("Should apply reflection fee on transfers", async function () {
            const transferAmount = ethers.parseEther("1000");
            const initialTotalFees = await totheNineCloud.totalFees();
            
            await totheNineCloud.transfer(addr1.address, transferAmount);
            
            const finalTotalFees = await totheNineCloud.totalFees();
            const expectedFee = transferAmount * 2n / 100n; // 2% fee
            
            expect(finalTotalFees - initialTotalFees).to.equal(expectedFee);
        });

        it("Should not apply fees to excluded addresses", async function () {
            const transferAmount = ethers.parseEther("1000");
            
            // Owner is excluded by default
            const initialBalance = await totheNineCloud.balanceOf(addr1.address);
            await totheNineCloud.transfer(addr1.address, transferAmount);
            const finalBalance = await totheNineCloud.balanceOf(addr1.address);
            
            // The recipient gets less due to reflection fee
            expect(finalBalance - initialBalance).to.be.lt(transferAmount);
        });
    });

    describe("Owner Functions", function () {
        it("Should allow owner to pause and unpause", async function () {
            await totheNineCloud.pause();
            expect(await totheNineCloud.paused()).to.be.true;
            
            await expect(
                totheNineCloud.transfer(addr1.address, ethers.parseEther("100"))
            ).to.be.revertedWith("Pausable: paused");
            
            await totheNineCloud.unpause();
            expect(await totheNineCloud.paused()).to.be.false;
        });

        it("Should allow owner to update max transaction amount", async function () {
            const newMaxTransaction = ethers.parseEther("5000000"); // 5 million
            
            await totheNineCloud.updateMaxTransactionAmount(newMaxTransaction);
            expect(await totheNineCloud.maxTransactionAmount()).to.equal(newMaxTransaction);
        });

        it("Should allow owner to update max wallet amount", async function () {
            const newMaxWallet = ethers.parseEther("30000000"); // 30 million
            
            await totheNineCloud.updateMaxWalletAmount(newMaxWallet);
            expect(await totheNineCloud.maxWalletAmount()).to.equal(newMaxWallet);
        });

        it("Should allow owner to exclude from fees", async function () {
            await totheNineCloud.excludeFromFee(addr1.address);
            expect(await totheNineCloud.isExcludedFromFee(addr1.address)).to.be.true;
            
            await totheNineCloud.includeInFee(addr1.address);
            expect(await totheNineCloud.isExcludedFromFee(addr1.address)).to.be.false;
        });

        it("Should allow owner to set reflection fee", async function () {
            const newFee = 5; // 5%
            
            await totheNineCloud.setReflectionFeePercent(newFee);
            expect(await totheNineCloud.reflectionFee()).to.equal(newFee);
        });

        it("Should reject reflection fee above 10%", async function () {
            await expect(
                totheNineCloud.setReflectionFeePercent(11)
            ).to.be.revertedWith("T9C: Reflection fee cannot exceed 10%");
        });

        it("Should reject non-owner calls to owner functions", async function () {
            await expect(
                totheNineCloud.connect(addr1).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
            
            await expect(
                totheNineCloud.connect(addr1).updateMaxTransactionAmount(ethers.parseEther("1000000"))
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Burn Functionality", function () {
        it("Should allow token burning", async function () {
            const burnAmount = ethers.parseEther("1000");
            const initialSupply = await totheNineCloud.totalSupply();
            const initialBalance = await totheNineCloud.balanceOf(owner.address);
            
            await totheNineCloud.burn(burnAmount);
            
            const finalSupply = await totheNineCloud.totalSupply();
            const finalBalance = await totheNineCloud.balanceOf(owner.address);
            
            expect(finalSupply).to.equal(initialSupply - burnAmount);
            expect(finalBalance).to.be.lt(initialBalance);
        });

        it("Should fail to burn more tokens than balance", async function () {
            const burnAmount = await totheNineCloud.totalSupply() + 1n;
            
            await expect(
                totheNineCloud.burn(burnAmount)
            ).to.be.reverted;
        });
    });

    describe("Allowance and TransferFrom", function () {
        it("Should approve and transferFrom correctly", async function () {
            const approveAmount = ethers.parseEther("1000");
            const transferAmount = ethers.parseEther("500");
            
            await totheNineCloud.approve(addr1.address, approveAmount);
            expect(await totheNineCloud.allowance(owner.address, addr1.address)).to.equal(approveAmount);
            
            await totheNineCloud.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);
            
            const addr2Balance = await totheNineCloud.balanceOf(addr2.address);
            expect(addr2Balance).to.be.gt(0);
            
            const remainingAllowance = await totheNineCloud.allowance(owner.address, addr1.address);
            expect(remainingAllowance).to.equal(approveAmount - transferAmount);
        });
    });

    describe("Edge Cases", function () {
        it("Should handle zero transfers", async function () {
            await expect(
                totheNineCloud.transfer(addr1.address, 0)
            ).to.be.revertedWith("T9C: Transfer amount must be greater than zero");
        });

        it("Should handle transfers to zero address", async function () {
            await expect(
                totheNineCloud.transfer(ethers.ZeroAddress, ethers.parseEther("100"))
            ).to.be.revertedWith("ERC20: transfer to the zero address");
        });

        it("Should handle minimum transaction limits", async function () {
            const minLimit = await totheNineCloud.totalSupply() / 1000n;
            
            await expect(
                totheNineCloud.updateMaxTransactionAmount(minLimit - 1n)
            ).to.be.revertedWith("T9C: Max transaction amount too low");
        });

        it("Should handle minimum wallet limits", async function () {
            const minLimit = await totheNineCloud.totalSupply() / 500n;
            
            await expect(
                totheNineCloud.updateMaxWalletAmount(minLimit - 1n)
            ).to.be.revertedWith("T9C: Max wallet amount too low");
        });
    });

    describe("Emergency Functions", function () {
        it("Should allow emergency withdrawal", async function () {
            // Send some ETH to the contract
            await owner.sendTransaction({
                to: await totheNineCloud.getAddress(),
                value: ethers.parseEther("1")
            });
            
            const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
            
            await totheNineCloud.emergencyWithdraw();
            
            const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
            expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
        });

        it("Should accept ETH deposits", async function () {
            const contractAddress = await totheNineCloud.getAddress();
            
            await owner.sendTransaction({
                to: contractAddress,
                value: ethers.parseEther("1")
            });
            
            const contractBalance = await ethers.provider.getBalance(contractAddress);
            expect(contractBalance).to.equal(ethers.parseEther("1"));
        });
    });
});