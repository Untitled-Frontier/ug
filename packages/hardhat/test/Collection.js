/* Generic Test Suite */

const { time, balance, expectRevert } = require('@openzeppelin/test-helpers');
const { MerkleTree } = require('merkletreejs');
const liveTree = require('../scripts/helpers/merkle_generator.js');
const liveLeaves = require('../scripts/helpers/leaves.js');
const keccak256 = require('keccak256');
const delay = duration => new Promise(resolve => setTimeout(resolve, duration));
const { expect } = require("chai");  
const { loadFixture } = require('ethereum-waffle');
const dataUriToBuffer = require('data-uri-to-buffer');
const { ethers } = require('hardhat');
const ether = require('@openzeppelin/test-helpers/src/ether');

/* CONFIG */

const fileName = "Collection";
const name = "Collection of NFTs";
const symbol = "NFTS";

const metadataDescription = "Ceramic beings with simulated souls collected by the Martian, Nyx.";

let dfPrice = "0.032"; // ~$100
let dfPriceHalf = "0.016";

/* END CONFIG */
let factory;

describe("Collection", function() {
  let instance;
  let provider;
  let signers;
  let accounts;
  let snapshot;
  const gasLimit = 30000000; // if gas limit is set, it doesn't superfluosly run estimateGas, slowing tests down.
  let merkleTree;
  let root;

  this.beforeAll(async function() {
    provider = new ethers.providers.Web3Provider(web3.currentProvider);
    signers = await ethers.getSigners();
    accounts = await Promise.all(signers.map(async function(signer) {return await signer.getAddress(); }));
    factory = await ethers.getContractFactory(fileName);
    const leaves = [accounts[6], accounts[7], accounts[8], accounts[9], accounts[10]];
    merkleTree = new MerkleTree(leaves, keccak256, { hashLeaves: true,  sort: true});
    root = merkleTree.getHexRoot();

    // latter parameters = collector, recipient, campaign_start, campaign_end 
    instance = await factory.deploy(name, symbol, accounts[2], accounts[3], '100', '1941431093', root); // wide campaign window for testfactory. dates tested separately
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

  //Campaign Tests
  it("Collection: test start date + end date", async () => {
    const instance2 = await factory.deploy(name, symbol, accounts[2], accounts[3], '2541431093', '3541431094', root); // wide campaign window for testfactory. dates tested separately
    await instance2.deployed();

    await expect(instance2.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit})).to.be.revertedWith("NOT_STARTED");
    await time.increaseTo("3541431095"); // 1 sec after end campaign
    await expect(instance2.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit})).to.be.revertedWith("ENDED");
  });

  it('Collection: Mint Merkle', async () => {
    const proof = merkleTree.getHexProof(keccak256(accounts[6]));
    const tx = await instance.connect(signers[6]).loyalMint(proof, {gasLimit});
    const receipt = await tx.wait();
    const tokenId = receipt.events[0].args.tokenId.toString();
    const claimed = await instance.claimed(accounts[6]);
    expect(claimed).to.be.true;
    expect(await instance.ownerOf(tokenId)).to.equal(accounts[6]);
  });

  it('Collection: Mint Merkle. Second Merkle Denied', async () => {
    const proof = merkleTree.getHexProof(keccak256(accounts[6]));
    const tx = await instance.connect(signers[6]).loyalMint(proof, {gasLimit});
    await expect(instance.connect(signers[6]).loyalMint(proof, {gasLimit})).to.be.revertedWith("Already claimed");
  });

  it('Collection: Mint From Non-Loyal Acc (not in merkle tree)', async () => {
    const proof = merkleTree.getHexProof(keccak256(accounts[3]));
    await expect(instance.connect(signers[3]).loyalMint(proof, {gasLimit})).to.be.revertedWith("Invalid Proof");
  });

  it('Collection: Mint From Non-Loyal Acc (not in merkle tree) (an existing proof)', async () => {
    const proof = merkleTree.getHexProof(keccak256(accounts[6]));
    await expect(instance.connect(signers[3]).loyalMint(proof, {gasLimit})).to.be.revertedWith("Invalid Proof");
  });

  // todo: why is the merkle lib printing the hexes in the tests?
  it('Collection: Mint Entire Merkle', async () => {
    await instance.connect(signers[6]).loyalMint(merkleTree.getHexProof(keccak256(accounts[6])), {gasLimit});
    await instance.connect(signers[7]).loyalMint(merkleTree.getHexProof(keccak256(accounts[7])), {gasLimit});
    await instance.connect(signers[8]).loyalMint(merkleTree.getHexProof(keccak256(accounts[8])), {gasLimit});
    await instance.connect(signers[9]).loyalMint(merkleTree.getHexProof(keccak256(accounts[9])), {gasLimit});
    await instance.connect(signers[10]).loyalMint(merkleTree.getHexProof(keccak256(accounts[10])), {gasLimit});
    await expect(instance.connect(signers[6]).loyalMint(merkleTree.getHexProof(keccak256(accounts[6])), {gasLimit})).to.be.revertedWith("Already claimed");
    await expect(instance.connect(signers[7]).loyalMint(merkleTree.getHexProof(keccak256(accounts[7])), {gasLimit})).to.be.revertedWith("Already claimed");
    await expect(instance.connect(signers[8]).loyalMint(merkleTree.getHexProof(keccak256(accounts[8])), {gasLimit})).to.be.revertedWith("Already claimed");
    await expect(instance.connect(signers[9]).loyalMint(merkleTree.getHexProof(keccak256(accounts[9])), {gasLimit})).to.be.revertedWith("Already claimed");
    await expect(instance.connect(signers[10]).loyalMint(merkleTree.getHexProof(keccak256(accounts[10])), {gasLimit})).to.be.revertedWith("Already claimed");
  });

  // do proper full merkle test with LIVE data
  it('Collection: Test LIVE Merkle with direct leaf minting', async () => {
    const tree = await liveTree(); // use liveLeaves
    const leaves = liveLeaves;
    const instance2 = await factory.deploy(name, symbol, accounts[2], accounts[3], '100', '1941431093', tree.getHexRoot()); // wide campaign window for testfactory. dates tested separately

    // use test account on live data root. should fail
    await expect(instance2.connect(signers[6]).loyalMintLeaf(tree.getHexProof(keccak256(leaves[0])), accounts[6], {gasLimit})).to.be.revertedWith("Invalid Proof");

    for(let i = 0; i < leaves.length; i+=1) {
      // UF is claimed on contract deployment to populate the NFT
      if(leaves[i] != "0xaf69610ea9ddc95883f97a6a3171d52165b69b03") {
        await instance2.connect(signers[6]).loyalMintLeaf(tree.getHexProof(keccak256(leaves[i])), leaves[i], {gasLimit});
      }
        await expect(instance2.connect(signers[6]).loyalMintLeaf(tree.getHexProof(keccak256(leaves[i])), leaves[i], {gasLimit})).to.be.revertedWith("Already claimed");
    }
  });

  // Default: Infinite Supply during campaign window
  it('Collection: Mint Default', async () => {
    const tx = await instance.connect(signers[1]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    const receipt = await tx.wait();
    const tokenId = receipt.events[0].args.tokenId.toString();

    expect(await instance.ownerOf(tokenId)).to.equal(accounts[1]);

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

  it('Collection: test withdraw of funds', async () => {
    await instance.connect(signers[3]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    await expect(instance.connect(signers[1]).withdrawETH()).to.be.revertedWith("NOT_COLLECTOR");
    const tx = await instance.connect(signers[2]).withdrawETH();
    await expect(tx).to.changeEtherBalance(signers[3], ethers.utils.parseEther(dfPrice));
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
    const tx = await sf.createSplit(rootHash);
    const receipt = await tx.wait();

    const SplitProxy = await ethers.getContractFactory("SplitProxy");
    const proxy = await SplitProxy.attach(cs);

    // new NFT with new recipient
    const instance2 = await factory.deploy("Souls", "SOULS3", accounts[2], proxy.address, '100', '3541431094', root); // wide campaign window for testfactory. dates tested separately
    await instance2.connect(signers[5]).mint({value: ethers.utils.parseEther(dfPrice), gasLimit});
    await expect(instance2.connect(signers[1]).withdrawETH()).to.be.revertedWith("NOT_COLLECTOR");
    const tx2 = await instance2.connect(signers[2]).withdrawETH({gasLimit});
    //await tx2.wait();
    await expect(tx2).to.changeEtherBalance(proxy, ethers.utils.parseEther(dfPrice)); // proxy received funds

    // now incrementWindow
    const wrappedProxy = await Splitter.attach(cs);
    await wrappedProxy.connect(signers[2]).incrementWindow(); // kicks off the proxy

    // claim funds
    // proofs were generated using the test suite from the splits repo (via mirror).
    const proof3 = ['0xd2b16e81b4697a13b932890b8d4a8d4c42bd6b5d3a3bd07f88076aff395214dd'];
    const proof4 = ['0x5acd7e3e41142de32e4123f02edf1ca5b9d81c4648728306d2cfbaaf916ab52b'];
    let dfPriceHalf = "0.016";
    const tx3 = await wrappedProxy.connect(signers[2]).claimForAllWindows(accounts[3], 50000000, proof3);
    await expect(tx3).to.changeEtherBalance(signers[3], ethers.utils.parseEther(dfPriceHalf)); // proxy received funds

    const tx4 = await wrappedProxy.connect(signers[1]).claimForAllWindows(accounts[4], 50000000, proof4);
    await expect(tx4).to.changeEtherBalance(signers[4], ethers.utils.parseEther(dfPriceHalf)); // proxy received funds

  });

});
