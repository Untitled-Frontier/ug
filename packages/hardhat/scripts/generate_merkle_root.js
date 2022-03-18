const generator = require('./helpers/merkle_generator.js');

async function main() {
    const tree = await generator();

    console.log("Full Merkle Tree: ", tree.toString());
    console.log("Merkle Root: ", tree.getHexRoot());
  }

  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });