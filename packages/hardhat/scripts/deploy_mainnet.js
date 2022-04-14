// import { ethers } from "ethers";
const generator = require('./helpers/merkle_generator.js');

async function main() {
    const tree = await generator();
    const root = tree.getHexRoot();
    console.log("Generated merkle root: ", root)
    const C = await ethers.getContractFactory("Collection");

    const startUnix = '1650290400'; //2022-04-18 14:00 UTC (10:00 EST)
    const endUnix = '1652709600'; // 2022-05-16 14:00 UTC (10:00 EST)
    const collector = '0xaF69610ea9ddc95883f97a6a3171d52165b69B03';
    const recipient = '0x2c48763e807F51D58cFc72f3D903513E12AF3551';
    const c = await C.deploy("Little Martians", "LMS", collector, recipient, startUnix, endUnix, root);
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