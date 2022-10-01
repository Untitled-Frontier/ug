const generator = require('./helpers/merkle_generator.js');

// UG merkle root: 0x7cc8028ca29b9825ff9247ea9ae162aefe188b90b2f671ff19850eb54e9d45df

async function main() {
    
    const tree = await generator();
    const root = tree.getHexRoot();
    console.log("Generated merkle root: ", root)

    const C = await ethers.getContractFactory("Collection");
    // name, symbole, recipient, startDate, endDate, merkle root
    const c = await C.deploy("Capsules of All Our Lives", "COAOL", "0xaF69610ea9ddc95883f97a6a3171d52165b69B03", '100', '2627308000', root, {gasLimit: "50000000"});
    const cd = await c.deployed();
    /*const id = await c.newlyMinted();
    //const ig = await cd.estimateGas.tokenURI(id);
    const i = await cd.generateImage(id);
    const t = await cd.generateTraits(id);
    const ii = await cd.indices(id);
    const u = await cd.tokenURI(id);

    //console.log(ig.toString());
    console.log(t.toString());
    //console.log(u.toString());
    console.log(id.toString());
    console.log(i.toString());
    console.log(ii.toString());
    console.log(u.toString());*/

    const cAddress = await c.address;
    console.log("UG deployed to: ", cAddress);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });