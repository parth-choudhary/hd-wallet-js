import bip32 from 'bip32';
import bip39 from 'bip39';
import typeforce from 'typeforce';

import { PURPOSE } from '../constants';

/**
 * Since we have access to hdNode at each path, we use it to derive further required values.
 * Everything (apart from the masterPublicKey) can also be derived from it's parent's xpub.
 * @class HDWallet
 */
class HDWallet {
  constructor({ mnemonics, network, coinType }) {
    typeforce('String', mnemonics);
    typeforce('Object', network);
    typeforce('Number', coinType);

    this.mnemonics = mnemonics;
    this.network = network;
    this.coinType = coinType;

    // get master and coinType node once initialized
    this.masterNodeObj = this.getMasterNode();
    this.coinTypeNodeObj = this.getCoinTypeNode();
  }

  /**
   * The masterPublicKey can be used as the key to store hdTree in localStorage
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
      derivationPath: "m/44'",
      path: {
        purpose: PURPOSE,
      },
    };
  };

  /**
   * Get coinType node, hardened derived from masterNode
   * @memberof HDWallet
   */
  getCoinTypeNode = () => {
    // equiv to m/44'/0'
    const coinTypeNode = this.masterNodeObj.masterNode.deriveHardened(this.coinType);
    const coinTypePublicKey = coinTypeNode.neutered().toBase58();

    return {
      coinTypeNode,
      coinTypePublicKey,
      derivationPath: `m/44'/${this.coinType}'`,
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
  getAccountNode = ({ accountIndex }) => {
    typeforce('Number', accountIndex);
    // equiv to m/44'/0'/0'
    const accountNode = this.coinTypeNodeObj.coinTypeNode.deriveHardened(accountIndex);
    const accountPublicKey = accountNode.neutered().toBase58();

    return {
      accountNode,
      accountPublicKey,
      derivationPath: `m/44'/${this.coinType}'/${accountIndex}'`,
      path: {
        purpose: PURPOSE,
        coinType: this.coinType,
        account: accountIndex,
      },
    };
  };

  /**
   * Generate address (internal or external) from accountNode.
   * changeIndex is either 0 (external) or 1 (internal)
   * @memberof HDWallet
   */
  getAddressNode = ({
    accountNode = null, accountIndex, changeIndex = 0, addressIndex,
  }) => {
    typeforce('?Object', accountNode);
    typeforce('Number', accountIndex);
    typeforce('Number', changeIndex);
    typeforce('Number', addressIndex);

    let _accountNode = accountNode;
    if (!_accountNode) {
      _accountNode = this.coinTypeNodeObj.coinTypeNode.deriveHardened(accountIndex);
    }

    // equiv m/44'/0'/0'/0/0
    const addressNode = _accountNode.derive(changeIndex).derive(addressIndex);
    return {
      addressNode,
      derivationPath: `m/44'/${this.coinType}'/${accountIndex}'/${changeIndex}/${addressIndex}`,
      path: {
        purpose: PURPOSE,
        coinType: this.coinType,
        account: accountIndex,
        changeIndex,
        addressIndex,
      },
    };
  };

  createHDTree = () => {};

  loadHDTree = () => {};

  getCurrentReceiveAddress = () => {};

  getCurrentChangeAddress = () => {};

  incrementRecieveAddress = () => {};

  incrementChangeAddress = () => {};

  runFullScanForAccount = () => {};
}

export default HDWallet;
