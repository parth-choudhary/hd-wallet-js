import BitcoinHDWallet from './bitcoin';

// delete below code. Only for testing
// const main = async () => {
//   const bitcoinHDWallet = new BitcoinHDWallet({ mnemonics: 'rajesh soni', testnet: true });
//   const ctree = await bitcoinHDWallet.runFullScan(false);
//   console.log(ctree);
// console.log(await bitcoinHDWallet.getAllTransactions(ctree));
// console.log(ctree);
// const targets = [
//   {
//     address: 'mz14T4PuLC3eRbqkotTFGxocGf3fdBu5jz',
//     value: 10000,
//   },
// ];
// const d = await bitcoinHDWallet.createRawTransaction({ coinTree: ctree, targets });
// console.log('>>>>', d);
// const utxos = await bitcoinHDWallet.fetchUTXOs([
//   ...ctree.accountTree[ctree.currAccountPublicKey].externalAddresses,
//   ...ctree.accountTree[ctree.currAccountPublicKey].internalAddresses,
// ]);
// console.log(utxos);

// const feeRate = await bitcoinHDWallet.getMiningFeeRate('fastestFee');
// const { inputs, outputs, fee } = bitcoinHDWallet.selectInputUTXOsForTransaction({
//   inputUTXOs: utxos,
//   feeRate,
//   targets,
// });
// console.log(inputs, outputs, fee);
// const currAddress = bitcoinHDWallet.getCurrentReceiveAddress(ctree);
// const currChangeAddress = bitcoinHDWallet.getCurrentChangeAddress(ctree);

// console.log('>>>', ctree);
// console.log('.............\n');
// console.log(await bitcoinHDWallet.storeCurrReceiveAddressInCoinTree(currAddress, ctree, true));

// console.log(
//   '>>>---',
//   await bitcoinHDWallet.convertBTCToFiat({
//     fiatCode: 'INR',
//     satoshis: 100000000,
//   }),
// );

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
// };

// main();
// delete above code.

export default {
  BitcoinHDWallet,
};
