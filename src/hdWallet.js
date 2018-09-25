import bip32 from 'bip32';
import bip39 from 'bip39';

import { PURPOSE } from './constants';

/**
 * Since we have access to hdNode at each path, we use it to derive further required values.
 * Everything (apart from the masterPublicKey) can also be derived from it's parent's xpub.
 *
 * @class HDWallet
 */
class HDWallet {
  constructor({ mnemonics, network, coinType }) {
    this.mnemonics = mnemonics;
    this.network = network;
    this.coinType = coinType;
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

  /**
   * Get coinType node, hardened derived from masterNode
   *
   * @memberof HDWallet
   */
  getCoinTypeNode = (masterNode) => {
    const coinTypeNode = masterNode.deriveHardened(this.coinType); // equiv to m/44'/0'
    const coinTypePublicKey = coinTypeNode.neutered().toBase58();

    return {
      coinTypeNode,
      coinTypePublicKey,
      path: {
        purpose: PURPOSE,
        coinType: this.coinType,
      },
    };
  };

  /**
   * Get accountNode, hardened derived from coinTypeNode.
   * accountIndex refers to the account, in hd wallet user can have multiple accounts
   * @memberof HDWallet
   */
  getAccountNode = (coinTypeNode, accountIndex) => {
    const accountNode = coinTypeNode.deriveHardened(accountIndex); // equiv to m/44'/0'/0'
    const accountPublicKey = accountNode.neutered().toBase58();

    return {
      accountNode,
      accountPublicKey,
      path: {
        purpose: PURPOSE,
        coinType: this.coinType,
        account: accountIndex,
      },
    };
  };

  /**
   * Generate address (internal or external) from accountNode.
   * change is either 0 (external) or 1 (internal)
   *
   * @memberof HDWallet
   */
  getAddressNode = (accountNode, accountIndex, change, addressIndex) => {
    const addressNode = accountNode.derive(change).derive(addressIndex); // equiv to m/44'/0'/0'/0/0
    return {
      addressNode,
      path: {
        purpose: PURPOSE,
        coinType: this.coinType,
        account: accountIndex,
        change,
        addressIndex,
      },
    };
  };

  getCurrentReceiveAddress = () => {};

  getCurrentChangeAddress = () => {};

  incrementRecieveAddress = () => {};

  incrementChangeAddress = () => {};

  runFullScanForAccount = () => {};
}

export default HDWallet;
