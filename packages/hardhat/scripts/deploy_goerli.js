const generator = require('./helpers/merkle_generator.js');

// UG merkle root: 0x7cc8028ca29b9825ff9247ea9ae162aefe188b90b2f671ff19850eb54e9d45df

async function main() {
    
    const tree = await generator();
    const root = tree.getHexRoot();
    console.log("Generated merkle root: ", root)

    const C = await ethers.getContractFactory("Collection");
    // name, symbole, recipient, startDate, endDate, merkle root
    // 1664908534 == Oct 4 2022 (keep it a few days for testing)
    // 0xE221A618e4A52ABF51Dd99406CfbBB32b41BBa06 == Goerli test 0xSplit
    const c = await C.deploy("Capsules of All Our Lives", "COAOL", "0xE221A618e4A52ABF51Dd99406CfbBB32b41BBa06", '100', '1664908534', root);
    const cd = await c.deployed();
    const cAddress = await c.address;
    console.log("UG deployed to: ", cAddress);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });