// import { ethers } from "ethers";
const generator = require('./helpers/merkle_generator.js');

async function main() {
    const tree = await generator();
    const root = tree.getHexRoot();
    console.log("Generated merkle root: ", root)
    const C = await ethers.getContractFactory("Collection");

    // 1648247492 = 2022-03-25
    const c = await C.deploy("Little Martians", "LMS","0xaF69610ea9ddc95883f97a6a3171d52165b69B03", "0xaF69610ea9ddc95883f97a6a3171d52165b69B03", '100', '1648247492', root);
    const cd = await c.deployed();
    const cAddress = await c.address;
    console.log("LM deployed to: ", cAddress);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });