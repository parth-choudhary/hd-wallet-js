import BitcoinHDWallet from './bitcoinHDWallet';

// delete below code. Only for testing
const bitcoinHDWallet = new BitcoinHDWallet({ mnemonics: 'rajesh soni', testnet: true });
const { masterNode, masterPublickKey } = bitcoinHDWallet.getMasterNode();
const { coinTypeNode, coinTypePublicKey } = bitcoinHDWallet.getCoinTypeNode(masterNode);
const { accountNode, accountPublicKey } = bitcoinHDWallet.getAccountNode(coinTypeNode, 0);
const { addressNode } = bitcoinHDWallet.getAddressNode(accountNode, 0, 0, 0);

console.log('::>', masterPublickKey, coinTypePublicKey, accountPublicKey);
console.log('>>>', bitcoinHDWallet.generateAddress(addressNode));
// delete above code.

export default {
  BitcoinHDWallet,
};
