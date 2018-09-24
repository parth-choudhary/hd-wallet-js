import bip32 from 'bip32';
import bip39 from 'bip39';

import { PURPOSE } from './constants';

class HDWallet {
  constructor({ mnemonics, network }) {
    this.mnemonics = mnemonics;
    this.network = network;
  }

  /**
   * The masterPublicKey can be used as the key to store hdTree in localStorage
   *
   * @memberof HDWallet
   */
  getMasterNode = () => {
    const seed = bip39.mnemonicToSeed(this.mnemonics);
    const root = bip32.fromSeed(seed, this.network);
    const masterNode = root.deriveHardened(PURPOSE); // equiv to m/44'
    const masterPublickKey = masterNode.neutered().toBase58();

    return {
      masterNode,
      masterPublickKey,
      path: {
        purpose: PURPOSE,
      },
    };
  };

  getCoinTypeNode = () => {};

  getAccountNode = () => {};

  getCurrentReceiveAddress = () => {};

  getCurrentChangeAddress = () => {};

  incrementRecieveAddress = () => {};

  incrementChangeAddress = () => {};

  runFullScanForAccount = () => {};
}

export default HDWallet;
