const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const overlap = require('./leaves.js');

async function main() {
    const leaves = overlap;
    const merkleTree = new MerkleTree(leaves, keccak256, { hashLeaves: true, sort: true});
    return merkleTree;
  }

  module.exports = main