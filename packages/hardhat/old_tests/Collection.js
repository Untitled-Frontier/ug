/* Generic Test Suite */

const { time, balance, expectRevert } = require('@openzeppelin/test-helpers');
const delay = duration => new Promise(resolve => setTimeout(resolve, duration));
const { expect } = require("chai");  
const { loadFixture } = require('ethereum-waffle');
const dataUriToBuffer = require('data-uri-to-buffer');
const { ethers } = require('hardhat');
const ether = require('@openzeppelin/test-helpers/src/ether');

/* CONFIG */

const fileName = "Collection";
const name = "Souls";
const symbol = "SOULS";

const metadataDescription = "Paintings of forgotten souls by various simulated minds that try to remember those who they once knew in the default world.";

let dfPrice = "0.01"; // ~$30
let dxPrice = "0.068"; // ~$200

/* END CONFIG */
let factory;

describe("Collection", function() {
  let instance;
  let provider;
  let signers;
  let accounts;
  let snapshot;
  const gasLimit = 30000000; // if gas limit is set, it doesn't superfluosly run estimateGas, slowing tests down.

  this.beforeAll(async function() {
    provider = new ethers.providers.Web3Provider(web3.currentProvider);
    signers = await ethers.getSigners();
    accounts = await Promise.all(signers.map(async function(signer) {return await signer.getAddress(); }));
    factory = await ethers.getContractFactory(fileName);

    // latter parameters = collector, recipient, campaign_start, campaign_end 
    instance = await factory.deploy(name, symbol, accounts[2], accounts[3], '100', '1941431093'); // wide campaign window for testfactory. dates tested separately
    await instance.deployed();
    snapshot = await provider.send('evm_snapshot', []);
  });

 this.beforeEach(async function() {
    await provider.send('evm_revert', [snapshot]);
    snapshot = await provider.send('evm_snapshot', []);
  });

  it('Collection: proper contract created', async () => {
    expect(await instance.name()).to.equal(name);
    expect(await instance.symbol()).to.equal(symbol);
  });

  /*Campaign Tests*/
  it("Collection: test start date + end date", async () => {
    const instance2 = await factory.deploy(name, symbol, accounts[2], accounts[3], '2541431093', '3541431094'); // wide campaign window for testfactory. dates tested separately
    await instance2.deployed();

    await expect(instance2.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit})).to.be.revertedWith("NOT_STARTED");
    await time.increaseTo("3541431095"); // 1 sec after end campaign
    await expect(instance2.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit})).to.be.revertedWith("ENDED");
  });


  // Default: Infinite Supply during campaign window
  it('Collection: Mint Default', async () => {
    const tx = await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    const receipt = await tx.wait();
    const tokenId = receipt.events[0].args.tokenId.toString();

    expect(await instance.ownerOf(tokenId)).to.equal(accounts[1]);

    const t = await instance.nftTypes(tokenId);
    expect(t).to.be.false; // default

    const blob = await instance.tokenURI(tokenId);
    const decoded = dataUriToBuffer(blob);
    const j = JSON.parse(decoded.toString());

    expect(j.description).to.equal(metadataDescription);
  });

  it('Collection: Not enough funds to mint default', async () => {
    await expect(instance.connect(signers[1]).mint({value: ethers.utils.parseEther('0.00001'), gasLimit})).to.be.revertedWith('MORE ETH NEEDED');
  });

  it('Collection: mint 10 defaults', async () => {
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    const tx = await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    const receipt = await tx.wait();
    const tokenId = receipt.events[0].args.tokenId.toString();

    expect(await instance.ownerOf(tokenId)).to.equal(accounts[1]);

  });

  /* Deluxe Soul (capped supply within campaign window) */
  it('Collection: mint deluxe', async () => {
    const tx = await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    const receipt = await tx.wait();
    const tokenId = receipt.events[0].args.tokenId.toString();

    expect(await instance.ownerOf(tokenId)).to.equal(accounts[1]);

    const t = await instance.nftTypes(tokenId);
    expect(t).to.be.true;
  });

  it('Collection: mint 10 deluxe', async () => {
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    const tx = await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    const receipt = await tx.wait();
    const tokenId = receipt.events[0].args.tokenId.toString();

    expect(await instance.ownerOf(tokenId)).to.equal(accounts[1]);
  });

  it("Collection: hit buyable cap", async () => {
    for(let i = 0; i < 96; i+=1) {
      await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    }

    await expect(instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit})).to.be.revertedWith("MAX_SOLD_96");
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    expect(await instance.buyableSupply()).to.equal('96');
  });

  /*Integration*/
  it('Collection: mint 5/5 default/deluxe', async () => {
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    await instance.connect(signers[2]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    await instance.connect(signers[3]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    await instance.connect(signers[4]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    const dxTx = await instance.connect(signers[5]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    await instance.connect(signers[2]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    await instance.connect(signers[3]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    await instance.connect(signers[4]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    const tx = await instance.connect(signers[5]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    const receipt = await tx.wait();
    const tokenId = receipt.events[0].args.tokenId.toString();

    const dxReceipt = await dxTx.wait();
    const dxTokenId = dxReceipt.events[0].args.tokenId.toString(); 

    expect(await instance.ownerOf(tokenId)).to.equal(accounts[5]);
    expect(await instance.ownerOf(dxTokenId)).to.equal(accounts[5]);
  });

  
  it('Collection: test withdraw of funds', async () => {
    await instance.connect(signers[3]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    await expect(instance.connect(signers[1]).withdrawETH()).to.be.revertedWith("NOT_COLLECTOR");
    const tx = await instance.connect(signers[2]).withdrawETH();
    await expect(tx).to.changeEtherBalance(signers[3], ethers.utils.parseEther(dxPrice));
  });

  // SPLITS TESTS //
  it('Collection: test withdraw of funds to split', async () => {
    const Splitter = await ethers.getContractFactory("Splitter");
    const sp = await Splitter.deploy();
    await sp.deployed();

    const SF = await ethers.getContractFactory("SplitFactory");
    const sf = await SF.deploy(sp.address, accounts[10]); // latter == weth address, but not important for test. 
    await sf.deployed();

    // root hash for accounts[3] + accounts[4] with 50/50 split.
    // this was custom generated using the test script from splits repo.
    const rootHash = '0x3c30c7610231699acc6248ba93b3f480704ba614ded4bd437375c6daf91bf096';
    const cs = await sf.callStatic.createSplit(rootHash);
    console.log(cs);
    const tx = await sf.createSplit(rootHash);
    const receipt = await tx.wait();

    const SplitProxy = await ethers.getContractFactory("SplitProxy");
    const proxy = await SplitProxy.attach(cs);

    // new NFT with new recipient
    const instance2 = await factory.deploy("Souls", "SOULS3", accounts[2], proxy.address, '100', '3541431094'); // wide campaign window for testfactory. dates tested separately
    await instance2.connect(signers[5]).mint({value: ethers.utils.parseEther(dxPrice), gasLimit});
    await expect(instance2.connect(signers[1]).withdrawETH()).to.be.revertedWith("NOT_COLLECTOR");
    const tx2 = await instance2.connect(signers[2]).withdrawETH({gasLimit});
    //await tx2.wait();
    await expect(tx2).to.changeEtherBalance(proxy, ethers.utils.parseEther(dxPrice)); // proxy received funds

    // now incrementWindow
    const wrappedProxy = await Splitter.attach(cs);
    await wrappedProxy.connect(signers[2]).incrementWindow(); // kicks off the proxy

    // claim funds
    // proofs were generated using the test suite from the splits repo (via mirror).
    const proof3 = ['0xd2b16e81b4697a13b932890b8d4a8d4c42bd6b5d3a3bd07f88076aff395214dd'];
    const proof4 = ['0x5acd7e3e41142de32e4123f02edf1ca5b9d81c4648728306d2cfbaaf916ab52b'];
    let dxPriceHalf = "0.034";
    const tx3 = await wrappedProxy.connect(signers[2]).claimForAllWindows(accounts[3], 50000000, proof3);
    await expect(tx3).to.changeEtherBalance(signers[3], ethers.utils.parseEther(dxPriceHalf)); // proxy received funds

    const tx4 = await wrappedProxy.connect(signers[1]).claimForAllWindows(accounts[4], 50000000, proof4);
    await expect(tx4).to.changeEtherBalance(signers[4], ethers.utils.parseEther(dxPriceHalf)); // proxy received funds

  });

});
