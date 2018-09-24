import bip39 from 'bip39';
import bitcoin from 'bitcoinjs-lib';
import coinSelect from 'coinselect';
import { findIndex, range } from 'lodash';

import HDWallet from './hdWallet';
import * as apiServices from './apiServices';
import { getConfig } from './utils';
import { PURPOSE, MAX_ACCOUNT_INDEX } from './constants';

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
    super({ mnemonics, network: getNetwork(testnet) });
    const {
      code, name, coinType, units, apis,
    } = getConfig(testnet ? 'TEST' : 'BTC');
    this.code = code;
    this.name = name;
    this.coinType = coinType;
    this.units = units;
    this.apis = apis;
  }

  convertSatoshisToBitcoins = satoshis => satoshis / this.units.value;

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
