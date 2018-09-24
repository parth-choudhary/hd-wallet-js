import BitcoinHDWallet from './bitcoinHDWallet';

// delete below code. Only for testing
const bitcoinHDWallet = new BitcoinHDWallet({ mnemonics: 'rajesh soni', testNet: true });
console.log(bitcoinHDWallet.getMasterNode());

// delete above code.

export default {
  BitcoinHDWallet,
};
