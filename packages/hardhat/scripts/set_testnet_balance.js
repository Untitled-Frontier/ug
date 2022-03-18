//a script to set the balance of a local address in testing environment

async function main() {
    await network.provider.send("hardhat_setBalance", [
      "0x0cacc6104d8cd9d7b2850b4f35c65c1ecdeece03",
      "0x100000000000000000",
    ]);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });