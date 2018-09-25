import bitcoin from 'bitcoinjs-lib';
import coinSelect from 'coinselect';
import { findIndex, range } from 'lodash';

import HDWallet from './hdWallet';
import * as apiServices from './apiServices';
import { getConfig } from './utils';

const getNetwork = testnet => (testnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin);

/**
 * Default we set testNet to true.
 * Need to be explicitly passed false in order to access actual n/w
 *
 * @class BitcoinHDWallet
 * @extends {HDWallet}
 */
class BitcoinHDWallet extends HDWallet {
  constructor({ mnemonics, testnet = true }) {
    super({ mnemonics, network: getNetwork(testnet), coinType: testnet ? 1 : 0 });
    const {
      code, name, units, apis,
    } = getConfig(testnet ? 'TEST' : 'BTC');
    this.code = code;
    this.name = name;
    this.units = units;
    this.apis = apis;
    this.network = getNetwork(testnet);
  }

  convertSatoshisToBitcoins = satoshis => satoshis / this.units.value;

  /**
   * Get addressNode from HDWallet base implementation
   * Generate wallet address from addressNode for bitcoin and family
   * @memberof BitcoinHDWallet
   */
  generateAddress = (addressNode) => {
    const wif = addressNode.toWIF();
    const keyPair = bitcoin.ECPair.fromWIF(wif, this.network);
    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: this.network,
    });
    return address;
  };

  getBalanceForAccountXpubs = (xpubs = []) => {};

  getBalanceForAddresses = (addresses = []) => {};

  fetchUTXOs = async (addresses = []) => {};

  getMiningFeeRate = async () => {
    // using fastest minig fee to make sure transactions are confirmed at the earliest
    const { success, data, error } = await apiServices.get(this.apis.minigFee);
    if (!success) {
      throw new Error(error);
    }
    // console.log(data)
    return data;
  };
}

export default BitcoinHDWallet;
