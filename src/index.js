import BitcoinHDWallet from './bitcoin';

// delete below code. Only for testing
const main = async () => {
  const bitcoinHDWallet = new BitcoinHDWallet({ mnemonics: 'rajesh soni', testnet: true });
  // const currentAccountIndex = await bitcoinHDWallet.runAccountDiscovery();
  // console.log('>>>', currentAccountIndex);
  // const xpubBalance = await bitcoinHDWallet.getBalanceForAccountXpubs([
  //   'tpubDDdSuZZeg9r81GNovECVKQHgPG8DyJHFhC2KudzGLiQGGvVaBqbbxYMhwbAazqSRFvvBg37SnfNHJaDwNiwMMZVCfyyVedMgHvBMGtEwRTL',
  // ]);

  const miningFee = await bitcoinHDWallet.getMiningFeeRate();
  console.log('>>', miningFee);
};

main();
// const { addressNode } = bitcoinHDWallet.getAddressNode({
//   accountIndex: 0,
//   change: 0,
//   addressIndex: 0,
// });

// console.log('>>>', bitcoinHDWallet.generateAddress(addressNode));
// delete above code.

export default {
  BitcoinHDWallet,
};
