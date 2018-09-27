import BitcoinHDWallet from './bitcoin';

// delete below code. Only for testing
const main = async () => {
  const bitcoinHDWallet = new BitcoinHDWallet({ mnemonics: 'rajesh soni', testnet: true });
  console.log(
    '>>>---',
    await bitcoinHDWallet.convertBTCToFiat({
      fiatCode: 'INR',
      satoshis: 100000000,
    }),
  );

  // const { addressNode } = bitcoinHDWallet.getAddressNode({
  //   accountIndex: 0,
  //   change: 0,
  //   addressIndex: 0,
  // });

  // try {
  //   console.log('>>>', bitcoinHDWallet.generateAddress(addressNode));
  // } catch (e) {
  //   console.log(e);
  // }

  // const currentAccountIndex = await bitcoinHDWallet.runFullScan();
  // console.log('>>>', currentAccountIndex);

  // const xpubBalance = await bitcoinHDWallet.getBalanceForAccountXpubs([]);

  // console.log(xpubBalance);
  // const miningFee = await bitcoinHDWallet.getMiningFeeRate();
  // console.log('>>', miningFee);
};

main();
// delete above code.

export default {
  BitcoinHDWallet,
};
