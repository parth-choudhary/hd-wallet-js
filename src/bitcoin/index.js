/* eslint-disable no-await-in-loop, no-constant-condition */
import bitcoin from 'bitcoinjs-lib';
import coinSelect from 'coinselect';
import { find, range } from 'lodash';
import typeforce from 'typeforce';

import HDWallet from '../hdWallet';
import * as apiServices from '../apiServices';
import { testnetConfig, mainnetConfig } from './config';
import { GAP_LIMIT, MAX_ACCOUNT_INDEX } from '../constants';

const getNetwork = testnet => (testnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin);

/**
 * Default we set testNet to true.
 * Need to be explicitly passed false in order to access mainnet
 * @class BitcoinHDWallet
 * @extends {HDWallet}
 */
class BitcoinHDWallet extends HDWallet {
  constructor({ mnemonics, testnet = true }) {
    typeforce('String', mnemonics);
    typeforce('Boolean', testnet);

    const {
      code, coinType, name, units, apis,
    } = testnet ? testnetConfig : mainnetConfig;
    const network = getNetwork(testnet);
    super({ mnemonics, network, coinType });

    this.code = code;
    this.name = name;
    this.units = units;
    this.apis = apis;
    this.network = network;
  }

  /**
   * helper method for satoshi to bitcoin conversion
   * @memberof BitcoinHDWallet
   */
  convertSatoshisToBitcoins = (satoshis) => {
    typeforce('Number', satoshis);
    return satoshis / this.units.value;
  };

  /**
   * Get addressNode from HDWallet base class implementation
   * Generate wallet address from addressNode for bitcoin and family
   * @memberof BitcoinHDWallet
   */
  generateAddress = (addressNode) => {
    typeforce('Object', addressNode);
    const wif = addressNode.toWIF();
    const keyPair = bitcoin.ECPair.fromWIF(wif, this.network);
    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: this.network,
    });
    return address;
  };

  /**
   * This method must be called when them master seed is imported from an external source
   * It returns the current accountIndex
   * @memberof BitcoinHDWallet
   * @todo Extract all addresses for further processing and make this dry for use in full scan
   */
  runAccountDiscovery = async () => {
    let currAccountIndex = null;
    for (let accountIndex = 0; accountIndex <= MAX_ACCOUNT_INDEX; accountIndex += 1) {
      if (currAccountIndex) {
        break;
      }

      let addressIndex = 0;
      let accountHasTxns = false;
      while (true) {
        const addresses = range(addressIndex, addressIndex + GAP_LIMIT).map((index) => {
          const { addressNode } = this.getAddressNode({
            accountIndex,
            changeIndex: 0,
            addressIndex: index,
          });
          return this.generateAddress(addressNode);
        });

        const { success, data, error } = await apiServices.get(
          `${this.apis.addressesInfo}?active=${addresses.join('|')}`,
        );

        if (!success) {
          throw new Error(error);
        }

        if (data.txs.length === 0) {
          // this set of 20 addresses do not have any txn associated with them
          if (!accountHasTxns) {
            currAccountIndex = accountIndex;
          }
          break;
        } else {
          accountHasTxns = true;
          // find last address index having n_tx > 0
          let lastAddressIndex = -1;
          addresses.forEach((address, index) => {
            const addressInfo = find(data.addresses, { address });
            if (addressInfo.n_tx > 0) {
              lastAddressIndex = index;
            }
          });
          addressIndex += lastAddressIndex + 1;
        }
      }
    }
    return currAccountIndex;
  };

  /**
   * Utility function for getting final balance across multiple xpubs
   * To be used in case you need to get wallet balance for bitcoin from across all accounts
   * @memberof BitcoinHDWallet
   */
  getBalanceForAccountXpubs = async (xpubs = []) => {
    typeforce(['String'], xpubs);
    if (xpubs.length === 0) return 0;
    const { success, data, error } = await apiServices.get(
      `${this.apis.addressesInfo}?active=${xpubs.join('|')}`,
    );
    if (!success) {
      throw new Error(error);
    }
    return data.wallet.final_balance;
  };

  getBalanceForAddresses = (addresses = []) => {};

  fetchUTXOs = async (addresses = []) => {};

  /**
   * Get mining fee rate
   * variant can be one of "fastestFee", "halfHourFee", "hourFee"
   * Make sure to include appropriate fee rate while creating transaction
   * @memberof BitcoinHDWallet
   */
  getMiningFeeRate = async (variant = 'fastestFee') => {
    typeforce('String', variant);
    const variants = ['fastestFee', 'halfHourFee', 'hourFee'];
    if (!variants.includes(variant)) {
      throw new TypeError(`variant must be one of ${variants.join(', ')}`);
    }

    const { success, data, error } = await apiServices.get(this.apis.minigFee);
    if (!success) {
      throw new Error(error);
    }
    return data[variant];
  };
}

export default BitcoinHDWallet;
