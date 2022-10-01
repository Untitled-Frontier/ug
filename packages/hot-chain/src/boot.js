const { Account, Address, BN } = require('@ethereumjs/vm/node_modules/ethereumjs-util');
const VM = require('@ethereumjs/vm').default;

async function boot() {
  const pk = Buffer.from(
    '1122334455667788112233445566778811223344556677881122334455667788',
    'hex'
  );

  console.log(pk);
  console.log(Address);
  const accountAddress = Address.fromPrivateKey(pk);
  const account = Account.fromAccountData({
    nonce: 0,
    balance: new BN(10).pow(new BN(18 + 2)), // 100 eth
  });

  const vm = new VM();
  await vm.stateManager.putAccount(accountAddress, account);

  return { vm, pk };
}

module.exports = boot;
