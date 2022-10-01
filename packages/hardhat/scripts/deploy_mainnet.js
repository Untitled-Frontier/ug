const generator = require('./helpers/merkle_generator.js');

// UG merkle root: 0x7cc8028ca29b9825ff9247ea9ae162aefe188b90b2f671ff19850eb54e9d45df

async function main() {
    
    const tree = await generator();
    const root = tree.getHexRoot();
    console.log("Generated merkle root: ", root)

    const C = await ethers.getContractFactory("Collection");
    const start ='1664805600'; // 3 Oct 14:00 GMT
    const end = '1667224800'; // 31 Oct 14:00 GMT
    const split = '0xF4fA7e95d8F115208841e97794a007997645f7C7'; // mainnet 0xsplit
    // name, symbol, recipient, startDate, endDate, merkle root
    const c = await C.deploy("Capsules of All Our Lives", "COAOL", split, start, end, root);
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